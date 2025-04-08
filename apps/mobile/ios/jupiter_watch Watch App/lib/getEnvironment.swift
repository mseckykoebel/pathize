//
//  getEnvironment.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/31/23.
//

import Foundation

func getEnvironmentType() -> AppEnvironmentType {
  // Try to read the Environment value from environment.strings
  let raw = NSLocalizedString("ENVIRONMENT", tableName: "environment", comment: "")

  // If the key is not defined, assume we are in production and do not show the app
  if raw == "ENVIRONMENT" {
    print("Failed to read environment.strings, setting to .production")
    return AppEnvironmentType.production
  } else {
    print("Successfully read environment.strings, setting to .\(raw)")
    return AppEnvironmentType(rawValue: raw) ?? AppEnvironmentType.production
  }
}
