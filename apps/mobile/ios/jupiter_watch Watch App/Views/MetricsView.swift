//
//  MetricsView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/27/23.
//

import SwiftUI
import WatchKit

struct MetricsView: View {
  @Environment(\.hapticsToggle) @Binding var hapticsToggle: Bool
  @Environment(\.vibrationDelay) @Binding var vibrationDelay: Int
  @EnvironmentObject var activityManager: ActivityManager
  @State var isWaitingForHaptic: Bool = false
  @State private var durationFormatter: DateComponentsFormatter = {
    let formatter = DateComponentsFormatter()
    formatter.allowedUnits = [.hour, .minute, .second]
    formatter.zeroFormattingBehavior = .pad
    return formatter
  }()
  var body: some View {
    TimelineView(
      MetricsTimelineSchedule(
        from: activityManager.builder?.startDate ?? Date()
      )
    ) { context in
      VStack(alignment: .leading) {
        if (activityManager.builder?.elapsedTime ?? 0) >= 3600 {
          Text(
            durationFormatter.string(from: TimeInterval(activityManager.builder?.elapsedTime ?? 0))
              ?? ""
          )
          .foregroundColor(Color.PathizeLightGreen)
          .font(
            .system(size: 28, design: .rounded)
              .monospacedDigit()
              .lowercaseSmallCaps())
        } else {
          ElapsedTimeView(
            elapsedTime: activityManager.builder?.elapsedTime ?? 0,
            showSubseconds: context.cadence == .live
          ).foregroundColor(Color.PathizeLightGreen).font(
            .system(size: 28, design: .rounded)
              .monospacedDigit()
              .lowercaseSmallCaps()
          )
        }

        Text("Elapsed time")
          .font(.system(.footnote))
          .foregroundColor(Color.PathizeLightGreen)

        let timeAboveLimit = activityManager.timeAboveLimit
        let hours = Int(timeAboveLimit) / 3600
        let minutes = Int(timeAboveLimit) / 60 % 60
        let seconds = Int(timeAboveLimit) % 60
        Text("\(hours)h, \(minutes)m, \(seconds)s")
          .font(.system(size: 26, design: .rounded).monospacedDigit().lowercaseSmallCaps())
          .foregroundColor(Color.PathizeRed)
        Text("Time above limit")
          .font(.system(.footnote))
          .foregroundColor(Color.PathizeRed)

        HStack {
          Text(
            activityManager.heartRate
              .formatted(
                .number.precision(.fractionLength(0))
              )
          )
          .font(.system(size: 28, design: .rounded).monospacedDigit().lowercaseSmallCaps())
          .lineLimit(1)
          Text("Current bpm")
            .font(.system(.footnote))
            .baselineOffset(-8)
        }

        HStack {
          Text(
            activityManager.maxHeartRate
              .formatted(
                .number.precision(.fractionLength(0))
              )
          )
          .font(.system(size: 28, design: .rounded).monospacedDigit().lowercaseSmallCaps())
          .lineLimit(1)
          Text("Max bpm")
            .font(.system(.footnote))
            .baselineOffset(-8)
        }
      }
      // END OF VSTACK
      .font(
        .system(.title, design: .rounded)
          .monospacedDigit()
          .lowercaseSmallCaps()
      )
      .frame(maxWidth: .infinity, alignment: .leading)
      .scenePadding()
      .padding(.top, 30)
    }
    // END OF TIMELINE VIEW
    .font(
      .system(.title, design: .rounded)
        .monospacedDigit()
        .lowercaseSmallCaps()
    )
    .scenePadding()
    .background(Color.PathizePrimary)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    .background(Color.PathizePrimary)
    .onChange(of: activityManager.lastSampleEndTime) { _ in
      if activityManager.heartRate > (activityManager.heartRateLimit ?? 0) && hapticsToggle
        && activityManager.running
      {
        if !isWaitingForHaptic {
          isWaitingForHaptic = true
          print("Limit exceeded. Playing haptic after a delay of: \(vibrationDelay)")
          DispatchQueue.main.asyncAfter(
            deadline: .now() + DispatchTimeInterval.seconds(vibrationDelay)
          ) {
            playHapticAfterDelay()
          }
        } else {
          print("Already waiting to play haptic. Skipping this one.")
        }
      }
    }
  }
  // causes vibration when user exceed heart rate limit, using a user-specified delay
  func playHapticAfterDelay() {
    isWaitingForHaptic = false
    WKInterfaceDevice.current().play(WKHapticType.failure)
  }
}

struct MetricsView_Previews: PreviewProvider {
  static var previews: some View {
    MetricsView()
      .environmentObject(ActivityManager())
  }
}

private struct MetricsTimelineSchedule: TimelineSchedule {
  var startDate: Date

  init(from startDate: Date) {
    self.startDate = startDate
  }

  func entries(from startDate: Date, mode: TimelineScheduleMode) -> PeriodicTimelineSchedule.Entries
  {
    PeriodicTimelineSchedule(
      from: self.startDate,
      by: (mode == .lowFrequency ? 1.0 : 1.0 / 30.0)
    ).entries(
      from: startDate,
      mode: mode
    )
  }
}
