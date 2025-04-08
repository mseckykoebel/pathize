//
//  WCManager.swift
//  jupiter_mobile
//
//  Created by AJ Hesby on 8/24/23.
//
import Foundation
import HealthKit
import React
import WatchConnectivity

@objc protocol AWCManagerSwiftDelegate {
  func emitMessageReceivedNoReply(name: String, message: [String: Any])
}

@objc public class AWCManagerSwift: NSObject {
  @objc weak var delegate: AWCManagerSwiftDelegate? = nil
  // checks whether the device supports watch connectivity
  @objc func isWCSupported() -> Bool {
    print("\(#function): isWCSupported was called")
    return WCSession.isSupported()
  }

  // starts activity on watch
  @objc func startActivity() {
    let configuration = HKWorkoutConfiguration()
    configuration.activityType = .other
    HKHealthStore().startWatchApp(
      with: configuration,
      completion: { wasSuccessful, err in
        guard err == nil else {
          self.handleReceivedMessage(message: [
            "Error": "There was an error launching the watch app: \(String(describing: err))"
          ])
          return
        }
        print("\(#function)-> started watch app")
        self.handleReceivedMessage(message: ["Success": "Apple watch launched successfully"])
      })
  }

  // sends context to apple watch
  @objc func sendContextToAppleWatch(
    context: [String: Any], resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock
  ) {
    if !context.keys.contains("userId") || !context.keys.contains("accessToken") {
      rejecter("", "Missing keys in context dictionary", sendContextError.missingKeys)
    }
    if !self.isPaired() {
      rejecter("", "Apple watch is not paired", sendContextError.notPaired)
    }
    if !self.isWatchAppInstalled() {
      rejecter("", "Apple watch app is not installed", sendContextError.notInstalled)
    }
    do {
      try WCSession.default.updateApplicationContext(context)
      resolver("Transferred context successfully")
    } catch let error {
      rejecter(
        "", "Failed with error: \(String(describing: error))", sendContextError.transferFailed)
    }
  }

  // sends a message without requiring a reply
  @objc func sendMessage(message: [String: Any] = ["message": "hi"]) {
    print("iPhone -> \(#function) sending message")
    WCSession.default.sendMessage(
      message, replyHandler: nil,
      errorHandler: { error in
        print("iPhone -> \(#function): error")
      })
  }

  @objc func handleReceivedMessage(message: [String: Any]) {
    //
    // [ handle any logic with activity duration etc. on swift side here ...]
    //
    delegate?.emitMessageReceivedNoReply(
      name: Event.messageReceivedNoReply.rawValue, message: message)
  }

  /// MARK: check apple watch reachability and connection
  @objc func isPaired() -> Bool {
    return WCSession.default.isPaired
  }
  @objc func isWatchAppInstalled() -> Bool {
    return WCSession.default.isWatchAppInstalled
  }
  @objc func isReachable() -> Bool {
    return WCSession.default.isReachable
  }
}
///
extension AWCManagerSwift {
  // List of emittable events
  enum Event: String, CaseIterable {
    // message received, reply is not needed
    case messageReceivedNoReply
  }
  enum sendContextError: Error {
    case missingKeys
    case notPaired
    case notInstalled
    case transferFailed
  }
  enum startActivityError: Error {
    case success
    case failure
  }
  @objc
  static var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue)
  }
}
