//
//  UserActivity.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/25/23.
//

import Foundation

class UserActivity: Identifiable {
  var pathizeUserActivity: PathizeUserActivity
  var duration: TimeInterval?
  var durationMinutes: Int? {
    return (self.duration != nil) ? Int((self.duration! / 60).rounded(.awayFromZero)) : 0
  }
  var notes: String?
  // used for both createdDay and time by calling .formatted with appropriate styles
  var createdDate: Date?
  init(withPathizeUserActivity pathizeActivity: PathizeUserActivity) {
    pathizeUserActivity = pathizeActivity
  }
}

extension UserActivity: Hashable {
  static func == (lhs: UserActivity, rhs: UserActivity) -> Bool {
    return lhs.pathizeUserActivity == rhs.pathizeUserActivity
  }
  func hash(into hasher: inout Hasher) {
    hasher.combine(pathizeUserActivity.id)
    hasher.combine(pathizeUserActivity.activityName)
  }
}
