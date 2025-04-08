//
//  ActivityManager.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/27/23.
//

import Foundation
import HealthKit
import SwiftUI

class ActivityManager: NSObject, ObservableObject {

  private var _appEnvironmentType: AppEnvironmentType?

  // checks to see if debug mode, and if it is, bypasses authorization checks
  var isDebugMode: Bool = false

  var appEnvironmentType: AppEnvironmentType {
    get {
      return self._appEnvironmentType ?? getEnvironmentType()
    }
    set(newValue) {
      _appEnvironmentType = newValue
    }
  }
  // manages Apple watch connectivity
  var connectivityManager: ConnectivityManager = ConnectivityManager.shared
  // manages local storage
  var storageManager: StorageManager = StorageManager.shared
  // manages api fetching
  var fetcher: Fetcher?
  // will be set when selectedPathizeUserActivity is set
  var selectedUserActivity: UserActivity?
  // this HKWorkoutActivityType is always "other," since we use custom activities
  @Published var syncingStatus: SyncingStatus = .initialStart
  @Published var savingStatus: SavingStatus?
  enum SavingStatus {
    case toBackend
    case toLocal
    case complete
  }

  // preset activity used for simple live tracking
  var presetActivity: PathizeUserActivity = PathizeUserActivity(
    id: "preset",
    userId: "presetUser",
    activityId: "presetActivity",
    activityName: "Monitoring heart rate",
    activityIcon: "presetIcon",
    activityPriority: 1,
    notes: "Preset notes",
    createdAt: "presetDate",
    updatedAt: "presetUpdateDate"
  )

  var hkActivity: HKWorkoutActivityType = HKWorkoutActivityType.other
  var selectedPathizeUserActivity: PathizeUserActivity? {
    didSet {
      guard selectedPathizeUserActivity != nil else { return }
      // if builder is not null, do not call startActivity because one is already active
      if self.builder != nil {
        return
      }
      // activityType is always HKWorkoutActivityType.other for now
      print("Starting activity")
      startActivity(activityType: hkActivity)

    }
  }
  override init() {
    super.init()
    // make connectivityManager point to this instance of ActivityManager
    self.connectivityManager.activityManager = self
  }

  var willSaveActivity: Bool = true
  var hasEndedActivity: Bool = false

  // we must record startDate in activityManager to later calculate activity duration
  var startDate: Date? = nil
  var withEndDate: Date? = nil

  let healthStore = HKHealthStore()
  var session: HKWorkoutSession?
  var builder: HKLiveWorkoutBuilder?

  func startActivity(activityType: HKWorkoutActivityType) {
    // check authorization before starting

    self.checkAuthorization()
    guard self.hkShareAuthorizationGranted && self.hkReadAuthorizationGranted else {
      self.requestAuthorization()
      return
    }

    let configuration = HKWorkoutConfiguration()
    configuration.activityType = activityType
    configuration.locationType = .outdoor

    do {
      session = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
      builder = session?.associatedWorkoutBuilder()
    } catch let error {
      print("could not begin activity session: \(String(describing: error))")
      return
    }

    builder?.dataSource = HKLiveWorkoutDataSource(
      healthStore: healthStore,
      workoutConfiguration: configuration
    )

    session?.delegate = self
    builder?.delegate = self
    // Start the workout session and begin data collection.
    self.startDate = Date()
    self.selectedUserActivity = UserActivity(withPathizeUserActivity: selectedPathizeUserActivity!)
    self.selectedUserActivity!.createdDate = self.startDate
    session?.startActivity(with: self.startDate!)
    builder?.beginCollection(withStart: self.startDate!) { (success, error) in
      // The activity has started.
      guard error == nil else {
        print("could not begin collection: \(String(describing: error))")
        DispatchQueue.main.async {
          self.resetActivity()
        }
        return
      }
      print("Started activity.")
    }
  }

  // MARK: - managing remotely starting an activity
  func startRemoteActivity(withId: String) {
    guard self.selectedPathizeUserActivity == nil else {
      print("tried to start remote activity while another one was selected")
      return
    }
    // find which activity this id describes
    self.fetcher?.performUpdates { result in
      switch result {
      case .success:
        var pathizeUserActivitySingleton: Set<PathizeUserActivity>?

        pathizeUserActivitySingleton = self.pathizeUserActivities.filter { activity in
          return activity.id == withId
        }
        if pathizeUserActivitySingleton?.count != 1 {
          print("A problem occurred")
          return
        }
        print("starting remote activity")
        guard let activity = pathizeUserActivitySingleton?.first else { return }
        self.selectedPathizeUserActivity = activity
        break
      case .failure:
        print("failed to retrieve activities")
        break
      }
    }
  }

  //MARK: - HealthKit Authorization

  // MEMBER VARIABLES

  @Published var hkShareAuthorizationGranted: Bool = true
  @Published var hkReadAuthorizationGranted: Bool = true
  let typesToShare: Set = [
    HKQuantityType.workoutType()
  ]
  // The quantity types to read from the health store.
  let typesToRead: Set = [
    HKQuantityType.quantityType(forIdentifier: .heartRate)!,
    HKObjectType.activitySummaryType(),
  ]

  // check both read and write permissions.

  func checkAuthorization() {
    if !isDebugMode {
      self.isShareAuthorizationGranted()
      self.isReadAuthorizationGranted()
    } else {
      self.hkReadAuthorizationGranted = true
      self.hkShareAuthorizationGranted = true
    }
  }

  // Check whether the user has granted permission for Pathize to read requested HealthKit data.
  // Returns:
  // true iff getRequestStatusForAuthorization returns .sharingAuthorized
  // false otherwise (.notDetermined or .sharingDenied)

  // NOTE: this is only for data WE can write to healthkit. Apple does not allow checking read permissions of healthkit data.

  func isShareAuthorizationGranted() {
    DispatchQueue.main.async {
      self.hkShareAuthorizationGranted =
        self.healthStore.authorizationStatus(for: HKQuantityType.workoutType())
        == .sharingAuthorized
    }
    print("Checked authorization status. Result: \(self.hkShareAuthorizationGranted)")
    print(
      "Actual value: \(self.healthStore.authorizationStatus(for: HKQuantityType.workoutType()))")
  }

  // since Apple does not allow us to directly verify read permissions with an API function
  // we can do a read query and see if it is empty. (this is the behavior apple describes in their documentation)
  func isReadAuthorizationGranted() {
    let query = HKSampleQuery(
      sampleType: HKQuantityType.quantityType(forIdentifier: .heartRate)!, predicate: nil, limit: 1,
      sortDescriptors: nil
    ) { query, sample, error in

      guard let sample = sample else {
        return
      }
      print("Sample: \(sample)")
      DispatchQueue.main.async {
        self.hkReadAuthorizationGranted = sample.count > 0
      }

    }
    self.healthStore.execute(query)
  }

  // Request authorization to access HealthKit.
  func requestAuthorization() {
    // The quantity type to write to the health store.
    let typesToShare: Set = [
      HKQuantityType.workoutType()
    ]

    // The quantity types to read from the health store.
    let typesToRead: Set = [
      HKQuantityType.quantityType(forIdentifier: .heartRate)!
      //          HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
      //          HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning)!,
      //          HKQuantityType.quantityType(forIdentifier: .distanceCycling)!,
      //          HKObjectType.activitySummaryType()
    ]

    // Request authorization for those quantity types.
    healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { (success, error) in
      // Handle error.
    }
  }
  // MARK: - State Control

  // The workout session state.
  @Published var running = false

  func pause() {
    session?.pause()
  }

  func resume() {
    session?.resume()
  }

  func togglePause() {
    if running == true {
      pause()
    } else {
      resume()
    }
  }

  func endActivity() {
    session?.end()
    if self.withEndDate == nil { self.withEndDate = Date() }
    self.duration = self.withEndDate!.timeIntervalSince(self.startDate ?? Date())
    guard let activity = self.selectedUserActivity else {
      print("attempted save without a selected activity")
      return
    }
    self.userTrackedActivity = UserTrackedActivity(withUserActivity: activity)
    self.userTrackedActivity!.userActivity.duration = self.duration
  }

  func saveActivity() {
    // discardWorkout() stops collection of data and discards workout data up to this point
    self.builder?.discardWorkout()
    if self.willSaveActivity {
      DispatchQueue.main.async { self.savingStatus = .toBackend }
      guard self.selectedPathizeUserActivity != nil else {
        print("selected user activity was nil")
        return
      }
      guard self.userTrackedActivity != nil else {
        print("User tracked activity was nil")
        return
      }

      // save data using Pathize api
      print("Saving activity to Pathize backend...")

      guard let body = self.userTrackedActivity!.getRecordBody() else {
        self.savingStatus = .complete
        return
      }
      guard let fetcher = self.fetcher else {
        self.savingStatus = .complete
        return
      }

      fetcher.createActivityRecord(withBody: body) { result in

        switch result {
        case .success:
          print("saved successfully to backend")
          DispatchQueue.main.async { self.savingStatus = .complete }

        case .failure:
          // use storage manager to save UserTrackedActivity locally
          DispatchQueue.main.async { self.savingStatus = .toLocal }
          print("failed to save activity to backend. Saving locally")
          self.storageManager.savePathizeTrackedActivity(usingRecordBody: body)
          DispatchQueue.main.async { self.savingStatus = .complete }
        }
      }
    } else {
      print("Discarded activity without saving")
    }
  }
  // MARK: - Workout Metrics
  @Published var averageHeartRate: Double = 0
  @Published var maxHeartRate: Double = 0
  @Published var timeAboveLimit: TimeInterval = 0
  @Published var lastSampleEndTime: Date? = nil
  @Published var lastSampleValue: Double = 0
  @Published var heartRate: Double = 0

  @Published var userTrackedActivity: UserTrackedActivity? = nil
  @Published var heartRateLimit: Double?
  // this is updated from connectivityManager
  @Published var pathizeUserActivities: Set<PathizeUserActivity> = Set<PathizeUserActivity>.init()
  // we must store the duration in ActivityManager since we don't actually save the HKWorkout
  @Published var duration: TimeInterval = 0

  func updateForStatistics(_ statistics: HKStatistics?) {
    guard let statistics = statistics else { return }

    DispatchQueue.main.async {
      switch statistics.quantityType {
      case HKQuantityType.quantityType(forIdentifier: .heartRate):
        let heartRateUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
        self.heartRate = statistics.mostRecentQuantity()?.doubleValue(for: heartRateUnit) ?? 0
        self.averageHeartRate = statistics.averageQuantity()?.doubleValue(for: heartRateUnit) ?? 0
        self.maxHeartRate = statistics.maximumQuantity()?.doubleValue(for: heartRateUnit) ?? 0

        // Compute incremental time above limit using the new algorithm
        if self.running, let limit = self.heartRateLimit, let lastEndTime = self.lastSampleEndTime {
          let additionalTimeAboveLimit = self.calculateTimeAboveLimit(
            currentSample: self.lastSampleValue,
            nextSample: self.heartRate,
            currentSampleTime: lastEndTime,
            nextSampleTime: statistics.endDate ?? Date(),
            limit: limit
          )
          // Accumulate the time above limit
          self.timeAboveLimit += additionalTimeAboveLimit
        }

        // Update last sample end time and value to be the current sample's
        self.lastSampleEndTime = statistics.endDate
        self.lastSampleValue = self.heartRate
      default:
        return
      }
    }
  }

  private func calculateTimeAboveLimit(
    currentSample: Double,
    nextSample: Double,
    currentSampleTime: Date,
    nextSampleTime: Date,
    limit: Double
  ) -> TimeInterval {
    let timeDiff = nextSampleTime.timeIntervalSince(currentSampleTime)
    // if timeDiff is greater than 5 minutes, we cannot reliably take the ratio, so return 0
    if timeDiff > 300 {
      return 0
    }

    var additionalTimeAboveLimit: TimeInterval = 0

    if (currentSample < limit && nextSample > limit)
      || (currentSample > limit && nextSample < limit)
    {
      let ratio = abs((limit - currentSample) / (nextSample - currentSample))
      let crossingTime = timeDiff * ratio

      if currentSample < limit {
        additionalTimeAboveLimit = timeDiff - crossingTime
      } else {
        additionalTimeAboveLimit = crossingTime
      }
    } else if currentSample >= limit && nextSample >= limit {
      additionalTimeAboveLimit = timeDiff
    }
    // No time is added if both samples are below the limit

    return additionalTimeAboveLimit
  }

  func resetActivity() {
    selectedPathizeUserActivity = nil
    builder = nil
    session = nil
    //activity = nil
    userTrackedActivity = nil
    maxHeartRate = 0
    heartRate = 0
    timeAboveLimit = 0
    lastSampleEndTime = nil
    lastSampleValue = 0
    withEndDate = nil
    startDate = nil
    hasEndedActivity = false
    savingStatus = nil
  }
}

// MARK: - HKWorkoutSessionDelegate
extension ActivityManager: HKWorkoutSessionDelegate {
  func workoutSession(
    _ activitySession: HKWorkoutSession,
    didChangeTo toState: HKWorkoutSessionState,
    from fromState: HKWorkoutSessionState,
    date: Date
  ) {
    print("activity changed state to \(toState)")
    DispatchQueue.main.async {
      self.running = toState == .running
    }
    // Wait for the session to transition states before ending the builder.
    if toState == .ended {
      print("activity ended")
      self.withEndDate = date
      DispatchQueue.main.async {
        self.hasEndedActivity = true
      }
    }
  }

  func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
    print("Error with workoutSession: \(String(describing: error))")
  }
}

// MARK: - HKLiveWorkoutBuilderDelegate
extension ActivityManager: HKLiveWorkoutBuilderDelegate {
  func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
  }

  func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    for type in collectedTypes {

      guard let quantityType = type as? HKQuantityType else { return }
      let statistics = workoutBuilder.statistics(for: quantityType)

      guard let statistics = statistics else { return }

      // Update the published values.
      updateForStatistics(statistics)
    }
  }
}
