//
//  Environment.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 7/28/23.
//

import Foundation
import SwiftUI

private struct pathKey: EnvironmentKey {
  static let defaultValue: Binding<NavigationPath> = .constant(NavigationPath())
}

private struct hapticsKey: EnvironmentKey {
  static let defaultValue: Binding<Bool> = .constant(true)
}

private struct vibrationDelayKey: EnvironmentKey {
  static let defaultValue: Binding<Int> = .constant(0)
}

private struct appEnvironmentKey: EnvironmentKey {
  static let defaultValue: Binding<AppEnvironmentType> = .constant(.development)
}

extension EnvironmentValues {

  // the path object used for NavigationViews
  var path: Binding<NavigationPath> {
    get { self[pathKey.self] }
    set { self[pathKey.self] = newValue }
  }

  // whether haptic feedback is enabled on Apple Watch
  var hapticsToggle: Binding<Bool> {
    get { self[hapticsKey.self] }
    set { self[hapticsKey.self] = newValue }
  }

  // the delay, if any, of vibration (in seconds)
  var vibrationDelay: Binding<Int> {
    get { self[vibrationDelayKey.self] }
    set { self[vibrationDelayKey.self] = newValue }
  }

  // appEnvironment can be 'staging', 'production', 'development', etc.
  var appEnvironment: Binding<AppEnvironmentType> {
    get { self[appEnvironmentKey.self] }
    set { self[appEnvironmentKey.self] = newValue }
  }
}
