//
//  ControlsView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/27/23.
//

import SwiftUI

struct ControlsView: View {
  @Environment(\.path) @Binding var path: NavigationPath
  @EnvironmentObject var activityManager: ActivityManager
  var body: some View {
    ZStack {
      Color.PathizePrimary
        .edgesIgnoringSafeArea(.all)
      VStack {
        HStack {
          VStack {
            Button(action: {
              // check if the current activity is the preset activity, and if it is, do what the delete button does and send us back to the start
              if activityManager.selectedPathizeUserActivity?.activityId
                == activityManager.presetActivity.activityId
              {
                activityManager.willSaveActivity = false
                activityManager.endActivity()

                path = NavigationPath()
                path.append(ActivityViewType.summary)
              } else {
                activityManager.endActivity()
                path = NavigationPath()
                path.append(ActivityViewType.save)
              }

              // send messages to the iOS app to update the active state, and update the list
              activityManager.connectivityManager.sendMessage(["runningStatus": "0"])
              activityManager.connectivityManager.sendMessage([
                "refreshActivities": "Activities need to be refreshed"
              ])
            }) {
              Image(systemName: "xmark")
            }
            .tint(Color.PathizeRed)
            .font(.title2)
            Text("End")
          }
          VStack {
            Button {
              if !activityManager.running {
                // update the last sample end time to not include the time when watch was paused
                activityManager.lastSampleEndTime = Date()
              }
              activityManager.togglePause()
            } label: {
              Image(systemName: activityManager.running ? "pause" : "play")
            }
            .tint(Color.green)
            .font(.title2)
            Text(activityManager.running ? "Pause" : "Resume")
          }
        }
      }
      //    .frame(maxWidth: .infinity, maxHeight: .infinity)
      //    .background(Color.PathizePrimary)
    }
  }
}

struct ControlsView_Previews: PreviewProvider {
  static var previews: some View {
    ControlsView()
      .environmentObject(ActivityManager())
  }
}
