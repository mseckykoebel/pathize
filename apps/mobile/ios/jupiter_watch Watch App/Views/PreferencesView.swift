//
//  HapticsView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/28/23.
//

import SwiftUI

struct PreferencesView: View {
  @EnvironmentObject var activityManager: ActivityManager
  @Environment(\.hapticsToggle) var hapticsToggle: Binding<Bool>
  @Environment(\.vibrationDelay) var vibrationDelay: Binding<Int>
  @Binding var selection: MainTab
  @State var waitingToSaveVibrationDelay: Bool = false
  private let integerFormatter: NumberFormatter = {
    let formatter = NumberFormatter()
    formatter.maximumIntegerDigits = 3
    formatter.numberStyle = .decimal
    return formatter
  }()
  var body: some View {

    ScrollView {
      VStack(alignment: .leading) {
        if activityManager.running != true {
          VStack {
            Button(action: {
              if activityManager.fetcher != nil {
                DispatchQueue.main.async {
                  activityManager.syncingStatus = .waitingForCredentials
                }
                activityManager.syncActivitiesAndLimit()
              }

            }) {
              Label("Sync data", systemImage: "arrow.triangle.2.circlepath")
            }
          }.padding([.all], 5)

          Divider()
        }

        Toggle(isOn: hapticsToggle) {
          Text("Vibration")
        }.padding([.all], 5)
        Text(
          "Vibrations are triggered when you exceed your heart rate limit but could shorten battery life."
        )
        .font(.system(size: 10))
        .foregroundColor(.gray)
        .padding([.bottom, .leading, .trailing], 5)

        Divider()

        Text("Vibration delay")
          .padding([.all], 5)
        Text(
          "Configure a delay between when you first go above your limit, and when a vibration will trigger."
        )
        .font(.system(size: 10))
        .foregroundColor(.gray)
        .padding([.leading, .trailing], 5)

        Picker("Scroll to desired delay", selection: vibrationDelay) {
          Text("None").tag(0)
          Text("30 seconds").tag(30)
          Text("1 minute").tag(60)
          Text("2 minutes").tag(2 * 60)
          Text("5 minutes").tag(5 * 60)
          Text("10 minutes").tag(10 * 60)
          Text("15 minutes").tag(15 * 60)
        }.pickerStyle(.wheel)
          .frame(height: 50)
          .padding([.leading, .trailing], 5)
          .padding(.bottom, 10)

        Divider()

        Text("Limit (bpm)")
          .padding([.all], 5)
        Text(
          "Your set heart rate limit. You can change your limit in the Pathize mobile app."
        )
        .font(.system(size: 10))
        .foregroundColor(.gray)
        .padding([.leading, .trailing], 5)

        // Show '-' if no limit from phone, and the number if limit was found
        if activityManager.heartRateLimit != nil {
          Text("\( Int(activityManager.heartRateLimit!))").padding([.all], 5)
        } else {
          Text("-").padding([.all], 5)
        }
      }
    }.background(Color.PathizePrimary, ignoresSafeAreaEdges: [.all])
      .toolbarBackground(Color.PathizePrimary, for: .navigationBar)
      .onChange(of: vibrationDelay.wrappedValue) { _ in
        saveVibrationDelay()
      }
  }
  func saveVibrationDelay() {
    if !waitingToSaveVibrationDelay {
      waitingToSaveVibrationDelay = true
      DispatchQueue.main.asyncAfter(deadline: .now() + DispatchTimeInterval.seconds(10)) {
        let delay: Int = vibrationDelay.wrappedValue
        print("Now saving delay using value: \(delay) seconds")
        StorageManager.shared.saveVibrationDelay(delay)
        waitingToSaveVibrationDelay = false
      }
    }
  }
}

#if DEBUG
  struct PreferencesView_Previews: PreviewProvider {
    static var previews: some View {
      PreferencesView(selection: .constant(.metrics)).environmentObject(ActivityManager())
    }
  }
#endif
