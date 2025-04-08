//
//  PathizeUserActivity.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/29/23.
//

import Foundation

struct PathizeUserActivity {
  let id: String
  let userId: String
  let activityId: String?
  let activityName: String
  let activityIcon: String
  let activityPriority: Int?
  let notes: String?
  let createdAt: String
  let updatedAt: String?
}

extension PathizeUserActivity: Identifiable, Hashable, Codable {
  static func == (lhs: PathizeUserActivity, rhs: PathizeUserActivity) -> Bool {
    return lhs.id == rhs.id
  }
  func hash(into hasher: inout Hasher) {
    hasher.combine(id)
    hasher.combine(activityName)
  }
}
