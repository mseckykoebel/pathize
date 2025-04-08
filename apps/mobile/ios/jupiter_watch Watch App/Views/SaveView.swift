//
//  SaveView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/30/23.
//

import SwiftUI

struct SaveView: View {
  @Environment(\.path) @Binding var path: NavigationPath
  @EnvironmentObject var activityManager: ActivityManager
  var body: some View {
    VStack {
      if activityManager.hasEndedActivity == false && activityManager.session != nil {
        ProgressView("Processing activity")
          .navigationBarHidden(true)
      } else {
        Text("Save activity?")
        HStack {
          Button("Save") {
            activityManager.willSaveActivity = true
            activityManager.saveActivity()
            path.append(ActivityViewType.summary)
          }
          Button("Delete") {
            path = NavigationPath()
            activityManager.willSaveActivity = false
            activityManager.saveActivity()
            activityManager.resetActivity()
          }
        }
      }

    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(Color.PathizePrimary)
  }
}

struct SaveView_Previews: PreviewProvider {
  static var previews: some View {
    SaveView()
      .environmentObject(ActivityManager())
  }
}
