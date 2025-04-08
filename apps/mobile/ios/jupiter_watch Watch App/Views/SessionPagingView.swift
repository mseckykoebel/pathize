//
//  SessionPagingView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/27/23.
//

import HealthKit
import SwiftUI
import WatchKit

struct SessionPagingView: View {
  @Environment(\.hapticsToggle) @Binding var hapticsToggle: Bool
  @Environment(\.isLuminanceReduced) var isLuminanceReduced
  @Environment(\.path) @Binding var path: NavigationPath
  @EnvironmentObject var activityManager: ActivityManager
  @State private var selection: MainTab = .metrics
  var pathizeUserActivity: PathizeUserActivity

  var body: some View {
    TabView(selection: $selection) {
      ControlsView().tag(MainTab.controls)
      MetricsView().tag(MainTab.metrics)
      PreferencesView(selection: $selection).tag(MainTab.haptics)
    }
    .navigationTitle(activityManager.selectedPathizeUserActivity?.activityName ?? "")
    .navigationBarBackButtonHidden(true)
    //.toolbar(.hidden, for: .navigationBar)
    .onAppear {
      // avoids app bricking if permissions are changed just before an activity is tracked
      if activityManager.selectedPathizeUserActivity == nil {
        print("activity was nil, resetting path")
        path = NavigationPath()
        path.append(ActivityViewType.start)
      } else {
        print("selected activity: \(activityManager.selectedPathizeUserActivity?.activityName ?? "none")")
      }

    }
    // this is what makes the pause/resume button send the app back to metrics view
    .onChange(of: activityManager.running) { _ in
      displayMetricsView()
    }
    .onChange(of: hapticsToggle) { _ in
      displayMetricsView()
    }
    .tabViewStyle(
      PageTabViewStyle(indexDisplayMode: isLuminanceReduced ? .never : .automatic)
    )
    .onChange(of: isLuminanceReduced) { _ in
      displayMetricsView()
    }
  }

  private func displayMetricsView() {
    withAnimation {
      selection = .metrics
    }
  }
}
