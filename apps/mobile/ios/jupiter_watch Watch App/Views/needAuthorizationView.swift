//
//  needAuthorizationView.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/3/23.
//

import SwiftUI

struct needAuthorizationView: View {
  @EnvironmentObject var activityManager: ActivityManager
  var body: some View {
    VStack {
      Image(systemName: "xmark.octagon")
        .padding(.bottom)
      Text(
        "Pathize does not have permission to read Apple Health data. Please navigate to\n\nSettings > Health > Apps > Pathize Health\n\n and turn on all requested health metrics in order to use Pathize for Apple Watch!"
      )
      .minimumScaleFactor(0.1)
      .padding(.horizontal)
    }
    // request auth to ensure permissions have been requested already
    .onAppear {
      activityManager.requestAuthorization()
    }
  }
}

struct needAuthorizationView_Previews: PreviewProvider {
  static var previews: some View {
    needAuthorizationView()
  }
}
