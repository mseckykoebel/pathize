//
//  ConnectivityManager.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/25/23.
//

import Foundation
import WatchConnectivity

// must inherit NSObject in order to conform to WCSessionDelegate protocol
class ConnectivityManager: NSObject, WCSessionDelegate {
  var activityManager: ActivityManager?
  @Published var messagesReceived: [String] = []
  @Published var activitiesReceived: Set<PathizeUserActivity> = Set<PathizeUserActivity>.init() {
    didSet {
      activityManager?.pathizeUserActivities = activitiesReceived
    }
  }
  @Published var baselineReceived: Double? {
    didSet {
      guard let baseline = baselineReceived else { return }
      activityManager?.heartRateLimit = baseline
    }
  }
  var credentials: [String: String] = [:] {
    didSet {
      if let fetcher = activityManager?.fetcher {
        fetcher.credentials = credentials
      } else {
        activityManager?.fetcher = Fetcher(
          activityManager: activityManager!, environmentType: activityManager!.appEnvironmentType)
        activityManager?.fetcher?.credentials = credentials
      }
    }
  }
  @Published var isActivated: Bool = false
  @Published var heartRateLimit: Double? {
    // update activityManager when limit is received
    didSet {
      guard let limit = heartRateLimit else { return }
      activityManager!.heartRateLimit = limit
    }
  }

  // MARK: watch reachability and connection checks

  func iOSDeviceNeedsUnlockAfterReboot() -> Bool {
    return WCSession.default.iOSDeviceNeedsUnlockAfterRebootForReachability
  }
  func isReachable() -> Bool {
    return WCSession.default.isReachable
  }
  func isCompanionAppInstalled() -> Bool {
    return WCSession.default.isCompanionAppInstalled
  }

  private override init() {
    super.init()
    // activate the WCSession
    if WCSession.isSupported() {
      let session = WCSession.default
      session.delegate = self
      session.activate()
    }
  }

  // singleton pattern
  static let shared = ConnectivityManager()

  func session(
    _ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    if let e = error {
      print("there was an error: \(e.localizedDescription)")
      return
    }

    print(
      "Apple Watch -> \(#function): Session activation completed with state \(activationState)")
    self.isActivated = true
  }

  func sessionReachabilityDidChange(_ session: WCSession) {

    if self.isReachable() {
      // self.activityManager?.getCredentials()
      // self.activityManager?.syncActivitiesAndLimit()
      self.activityManager?.uploadSavedActivities()
    }
  }

  // MARK: handling data transfer

  func sendActivity(trackedActivity: UserTrackedActivity) {
    self.sendMessage(trackedActivity.activityPayload)
  }

  func clearMessages() {
    DispatchQueue.main.async {
      self.messagesReceived.removeAll()
    }
  }

  // check the last-sent context dictionary for authentication keys
  func updateFromContext(_ completion: @escaping (Result<Any, ContextError>) -> Void) {
    let context = WCSession.default.receivedApplicationContext
    print(String(describing: context))
    if !context.keys.contains("userId") || !context.keys.contains("accessToken") {
      print("missing keys")
      completion(.failure(.missingKeys))
      return
    }
    var creds: [String: String] = [:]
    creds["userId"] = context["userId"] as? String
    creds["jwt"] = context["accessToken"] as? String
    // unpack the optional values. this fixes null checking
    let uid = creds["userId"] ?? "null"
    let jwt = creds["jwt"] ?? "null"
    if uid == "null" || jwt == "null" {
      print("key was null")
      completion(.failure(.missingKeys))
      return
    }
    DispatchQueue.main.async {
      self.credentials = creds
      completion(.success("Success"))
    }
    print("set credentials from existing receivedApplicationContext")
  }

  func session(_ session: WCSession, didReceiveApplicationContext context: [String: Any]) {
    if !context.keys.contains("userId") || !context.keys.contains("accessToken") {
      print("incorrect keys")
      return
    }
    var creds: [String: String] = [:]
    creds["userId"] = context["userId"] as? String
    creds["jwt"] = context["accessToken"] as? String
    DispatchQueue.main.async {
      self.credentials = creds
    }
    print("Update auth info from received application context")
    // check for pending activity
    if context.keys.contains("pendingActivity") {
      guard let activityId = context["pendingActivity"] as? String else { return }
      // check to see if the preset activity was selected by the user "watch mode"
      if activityId == "presetActivity" {
        self.activityManager?.selectedPathizeUserActivity = self.activityManager?.presetActivity
      }
      print("starting activity with associated ID: \(activityId)")
      DispatchQueue.main.async {
        if self.activityManager?.selectedPathizeUserActivity != nil {
          self.sendMessage([
            "activityReceived": "Activity is already running. Phone should still clear context."
          ])
        } else {
          self.sendMessage([
            "activityReceived":
              "Apple watch received activity. Phone should remove activityId from application context."
          ])
          self.activityManager?.startRemoteActivity(withId: activityId)
        }

      }
    }
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    print("message received!")
    DispatchQueue.main.async {
      message.forEach { key, value in
        // invariant: data received will always be in string format
        print("key: \(key), value: \(value)")
        switch key {
        case "limit":
          guard let stringValue = value as? String else { return }
          self.heartRateLimit = Double(stringValue)
          self.messagesReceived.append(stringValue)
        case "message":
          guard let stringValue = value as? String else { return }
          self.messagesReceived.append(stringValue)
        case "activities":
          let fetcher = self.activityManager?.fetcher
          fetcher?.updateUserActivities { result in
            return
          }
        case "credentials":
          var creds: [String: String] = [:]
          guard let creds_dict = value as? [String: String] else { return }
          creds["userId"] = creds_dict["userId"]
          creds["jwt"] = creds_dict["accessToken"]
          DispatchQueue.main.async {
            self.credentials = creds
            self.activityManager?.fetcher?.performUpdates { result in }
          }
        // make a new "running" case that, if received, returns 1 if activityManager.running is true, 0 if false
        case "running":
          print("running case running!")
          let running = self.activityManager?.running ?? false
          let runningString = running ? "1" : "0"
          self.sendMessage(["runningStatus": runningString])
        default:
          break
        }
      }
    }
  }

  func sendMessage(_ message: [String: Any] = ["message": "hello"]) {
    print("Apple Watch -> \(#function): sending message")
    WCSession.default.sendMessage(
      message, replyHandler: nil,
      errorHandler: { error in
        print("Apple Watch -> \(#function): error")
      })
  }

}
