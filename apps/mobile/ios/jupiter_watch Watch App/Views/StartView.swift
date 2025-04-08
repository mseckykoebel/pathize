//
//  ContentView.swift
//  Pathize Watch App
//
//  Created by Mason Secky-Koebel on 7/25/23.
//

import HealthKit
import SwiftUI
import WatchKit

struct StartView: View {
  @EnvironmentObject var activityManager: ActivityManager
  @State var displayText: String = ""
  @State private var isAnimating: Bool = false
  @State private var selectedActivity: PathizeUserActivity?

  var body: some View {
    let presetActivity = activityManager.presetActivity
    ZStack {
      Color.PathizePrimary
        .edgesIgnoringSafeArea(.all)
      VStack {
        NavigationStack {
          if activityManager.hkReadAuthorizationGranted
            && activityManager.hkShareAuthorizationGranted
          {
            ScrollView {
              if activityManager.pathizeUserActivities.count == 0 {
                VStack {
                  Text(getDisplayText())
                    .padding(10)
                    .multilineTextAlignment(.center)
                    .opacity(isAnimating ? 0.2 : 1.0)
                    .animation(
                      .easeInOut(duration: 3)
                        .repeatForever(),
                      value: isAnimating
                    )
                    .onAppear {
                      isAnimating = true
                    }
                }
              } else {
                // TOP AREA TITLE
                HStack {
                  Text("Monitor your live heart rate")
                    .padding([.top, .leading, .trailing], 5)
                  Spacer()
                }
                // TOP AREA DESCRIPTION
                Text(
                  "Passively monitor your heart rate for when you go above your limit."
                )
                .font(.system(size: 10))
                .foregroundColor(.gray)
                .padding([.leading, .trailing], 5)
                // TOP AREA - SIMPLY JUST PASSIVELY RECORD
                VStack(alignment: .leading) {
                  Button(action: {
                    // set the preset activity as the selected activity
                    activityManager.selectedPathizeUserActivity = presetActivity
                  }) {
                    Text("Start")
                  }
                }.padding([.all], 5)

                Divider()

                // TRACKING A LIVE ACTIVITY
                HStack {
                  Text("Track a live activity")
                    .padding([.top, .leading, .trailing], 5)
                  Spacer()
                }

                // DESCRIPTION OF ACTIVITY TRACKING
                Text(
                  "Track and correlate exertion with a live activity."
                )
                .font(.system(size: 10))
                .foregroundColor(.gray)
                .padding([.bottom, .leading, .trailing], 5)

                ForEach(
                  activityManager.pathizeUserActivities.map { $0 }.sorted { activityA, activityB in
                    // sorts alphabetically, using lowercased version of activity name
                    return activityA.activityName.lowercased() < activityB.activityName.lowercased()
                  }
                ) { pathizeUserActivity in
                  NavigationLink(pathizeUserActivity.activityName, value: pathizeUserActivity)
                }
              }
            }
            .listStyle(.carousel)
          } else {
            needAuthorizationView()
              .onAppear {
                activityManager.requestAuthorization()
                activityManager.checkAuthorization()
              }
          }
        }
      }
    }
    .onAppear {
      activityManager.checkAuthorization()
    }
  }

  func getDisplayText() -> String {
    switch activityManager.syncingStatus {
    case .initialStart:
      return "Press sync to load your activities"
    case .waitingForCredentials:
      return "Loading your information..."
    case .inProgress:
      return "Syncing...this might take a moment"
    case .successful:
      return "No activities found! To start, add an activity in the Pathize iPhone app"
    case .needCredentialsFromPhone:
      return
        "Waiting for information from your iPhone. Opening the Pathize mobile app may help your data sync faster"
    case .failed:
      return
        "We failed to load your activities. Press sync again, or open the Pathize mobile app while you're logged in"
    case .code403:
      return
        "Your watch needs to be re-synced — open the Pathize mobile app and press sync on your watch"
    case .code404Activities:
      return "Please add activities in the Pathize mobile app"
    case .code404Limit:
      return "Please set a heart rate limit in the Pathize mobile app"
    case .code500Activities:
      return "There was an issue getting your activities"
    case .code500Limit:
      return "There was an issue getting your limit"
    case .timedOut:
      return "Retrieving your information took too long. Press sync to try again"
    }

  }
}

#if DEBUG
  struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
      let activityManager = ActivityManager()
      let dummyActivities: [PathizeUserActivity] = [
        PathizeUserActivity(
          id: "1", userId: "user1", activityId: "activity1", activityName: "Running",
          activityIcon: "icon1", activityPriority: 1, notes: "Note1", createdAt: "2021-01-01",
          updatedAt: "2021-01-02"),
        PathizeUserActivity(
          id: "2", userId: "user2", activityId: "activity2", activityName: "Cycling",
          activityIcon: "icon2", activityPriority: 2, notes: "Note2", createdAt: "2021-02-01",
          updatedAt: "2021-02-02"),
        PathizeUserActivity(
          id: "3", userId: "user3", activityId: "activity3", activityName: "Walking",
          activityIcon: "icon3", activityPriority: 3, notes: "Note3", createdAt: "2021-03-01",
          updatedAt: "2021-03-02"),
      ]
      activityManager.pathizeUserActivities = Set(dummyActivities)
      activityManager.isDebugMode = true
      return StartView()
        .environmentObject(activityManager)
    }
  }
#endif

extension HKWorkoutActivityType: Identifiable {
  public var id: UInt {
    rawValue
  }
  var name: String {
    switch self {
    case .running:
      return "Run"
    case .cycling:
      return "Bike"
    case .walking:
      return "Walk"
    default:
      return ""
    }
  }
}
