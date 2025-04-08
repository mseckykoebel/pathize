//
//  TestView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/25/23.
//

import SwiftUI

struct TestView: View {
  @EnvironmentObject var am: ActivityManager
  @State var sentCount: Int = 0
  var body: some View {
    VStack {
      Text("Messages received from phone: ")
        .bold()
      Button(action: {
        sentCount += 1
        am.connectivityManager.sendMessage(["message": "hello \(sentCount)"])
      }) {
        Text("Send message to phone (\(sentCount))")
          .fixedSize(horizontal: false, vertical: true)
      }
      Button(action: {
        DispatchQueue.main.async {
          sentCount = 0
          am.connectivityManager.clearMessages()
        }
      }) {
        Text("Reset")
          .fixedSize(horizontal: false, vertical: true)
      }
      ScrollView {
        VStack {
          ForEach($am.connectivityManager.messagesReceived, id: \.self) { $msg in
            Text("message: \(msg)")
          }
        }
        .padding()
      }
    }
  }
}

struct TestView_Previews: PreviewProvider {
  static var previews: some View {
    TestView()
      .environmentObject(ActivityManager())
  }
}
