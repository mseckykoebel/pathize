//
//  jupiter_watchApp.swift
//  Pathize Watch App
//
//  Created by Mason Secky-Koebel on 7/25/23.
//

import HealthKit
import SwiftUI

@main
struct jupiter_watchApp: App {

  @Environment(\.scenePhase) private var scenePhase
  @StateObject var activityManager = ActivityManager()
  @State var path = NavigationPath()
  @State var hapticsToggle: Bool = true
  // delay of vibration, in seconds
  @State var vibrationDelay: Int = 0
  @State var selection: MainTab = .start
  @State var appEnvironment: AppEnvironmentType

  init() {
    // Try to read the Environment value from environment.strings
    let raw = NSLocalizedString("ENVIRONMENT", tableName: "environment", comment: "")

    // If the key is not defined, assume we are in production and do not show the app
    if raw == "ENVIRONMENT" {
      _appEnvironment = State(initialValue: AppEnvironmentType.production)
      print("Failed to read environment.strings, setting to .production")
    } else {
      print("Successfully read environment.strings, setting to .\(raw)")
      let initialState: AppEnvironmentType =
        AppEnvironmentType(rawValue: raw) ?? AppEnvironmentType.production
      _appEnvironment = State(initialValue: initialState)
    }

    // read in value of vibrationDelay from local storage
    _vibrationDelay = State(initialValue: StorageManager.shared.getVibrationDelay())
    print("Read value of vibrationDelay as: \(vibrationDelay) seconds")

    // check and see if an activity is running, and if it is, set the selection to metrics
    if activityManager.running {
      _selection = State(initialValue: .metrics)
    }
  }

  var body: some Scene {
    WindowGroup {
      NavigationStack(path: $path) {
        TabView(selection: $selection) {
          StartView().tag(MainTab.start)
          PreferencesView(selection: $selection).tag(MainTab.haptics)
        }
        .onChange(of: scenePhase) { newScenePhase in
          if newScenePhase == .active {
            print("Watch app did become active")
            activityManager.requestAuthorization()
            if appEnvironment != .development {
              activityManager.checkAuthorization()
            } else {
              print(
                "Note: we are in development mode, so ensure authorization is granted manually in settings"
              )
            }
            if activityManager.fetcher == nil {
              activityManager.fetcher = Fetcher(
                activityManager: activityManager,
                environmentType: activityManager.appEnvironmentType)
            }
            // sync when app becomes active
            activityManager.getCredentials()
            activityManager.syncActivitiesAndLimit()
          }
        }
        .onChange(of: activityManager.syncingStatus) { status in
          withAnimation {
            selection = .start
          }
        }
        .onChange(of: activityManager.running) { running in
          if running {
            selection = .metrics
          }
        }
        .onChange(of: activityManager.selectedPathizeUserActivity) { activity in
          // if permissions are not set, clear selected activity and return
          if activityManager.hkShareAuthorizationGranted == false
            || activityManager.hkReadAuthorizationGranted == false
          {
            activityManager.selectedPathizeUserActivity = nil
            return
          }
          // hack to make view change when remote workout starts
          guard let selectedActivity = activity else { return }
          path = NavigationPath()
          path.append(selectedActivity)
        }
        .navigationDestination(for: PathizeUserActivity.self) { pathizeUserActivity in
          SessionPagingView(pathizeUserActivity: pathizeUserActivity)
            .onAppear { activityManager.selectedPathizeUserActivity = pathizeUserActivity }
        }
        .navigationDestination(for: ActivityViewType.self) { activityViewType in
          switch activityViewType {
          case .start:
            StartView()
              .navigationBarHidden(true)
          case .summary:
            SummaryView()
              .navigationBarHidden(true)
          case .processing:
            ProgressView("Processing activity")
              .navigationBarHidden(true)
          case .save:
            SaveView()
              .navigationBarHidden(true)
          case .metrics:
            MetricsView()
              .navigationBarHidden(true)
          }
        }
        .toolbarBackground(Color.PathizePrimary, for: .navigationBar)
      }.environment(\.path, $path)
        .environment(\.hapticsToggle, $hapticsToggle)
        .environment(\.vibrationDelay, $vibrationDelay)
        .environment(\.appEnvironment, $appEnvironment)
        .environmentObject(activityManager)
    }

  }
}
