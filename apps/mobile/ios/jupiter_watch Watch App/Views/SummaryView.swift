//
//  SummaryView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/27/23.
//

import HealthKit
import SwiftUI

struct SummaryView: View {
  @Environment(\.dismiss) var dismiss
  @Environment(\.path) @Binding var path: NavigationPath
  @EnvironmentObject var activityManager: ActivityManager
  @State private var durationFormatter: DateComponentsFormatter = {
    let formatter = DateComponentsFormatter()
    formatter.allowedUnits = [.hour, .minute, .second]
    formatter.zeroFormattingBehavior = .pad
    return formatter
  }()
  var body: some View {
    VStack {
      if activityManager.savingStatus == .toBackend {
        ProgressView("Saving activity to Pathize")
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .background(Color.PathizePrimary)
      } else if activityManager.savingStatus == .toLocal {
        ProgressView("Cannot currently reach Pathize. Saving activity to Apple watch")
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .background(Color.PathizePrimary)
      } else {
        ScrollView(.vertical) {
          VStack(alignment: .leading) {
            SummaryMetricView(
              title: "Total Time",
              value: durationFormatter.string(from: activityManager.duration) ?? ""
            ).accentColor(Color.green)
            SummaryMetricView(
              title: "Time Above Limit",
              value: durationFormatter.string(from: activityManager.timeAboveLimit) ?? ""
            ).accentColor(Color.PathizeRed)
            SummaryMetricView(
              title: "Average Heart Rate",
              value: "\(Int(round(activityManager.averageHeartRate))) bpm"
            )
            SummaryMetricView(
              title: "Max Heart Rate",
              value: "\(Int(round(activityManager.maxHeartRate))) bpm"
            )
            Button("Done") {
              path = NavigationPath()
              activityManager.resetActivity()
            }
          }
          .scenePadding()
        }
        .navigationTitle("Summary")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
          activityManager.connectivityManager.sendMessage([
            "refreshActivities": "Activities need to be refreshed"
          ])
        }

      }
    }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .background(Color.PathizePrimary)
  }

}

#if DEBUG
  struct SummaryView_Previews: PreviewProvider {
    static var previews: some View {
      SummaryView()
        .environmentObject(ActivityManager())
    }
  }
#endif

struct SummaryMetricView: View {
  var title: String
  var value: String

  var body: some View {
    Text(title)
    Text(value)
      .font(
        .system(.title2, design: .rounded)
          .lowercaseSmallCaps()
      )
      .foregroundColor(.accentColor)
    Divider()
  }
}
