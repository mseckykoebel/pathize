//
//  UserTrackedActivity.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/26/23.
//

import Foundation

// convenience wrapper class for transferring user activities to the iPhone and Pathize backend.
class UserTrackedActivity {
  var userActivity: UserActivity
  init(withUserActivity userActivity: UserActivity) {
    self.userActivity = userActivity
  }

  func getRecordBody() -> PathizeActivityRecordBody? {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd"
    let p = self.userActivity.pathizeUserActivity
    guard self.userActivity.createdDate != nil else { return nil }
    return PathizeActivityRecordBody(
      userId: p.userId, userActivityId: p.id, activityIcon: p.activityIcon,
      activityName: p.activityName, activityPriority: p.activityPriority,
      activityTotalTime: userActivity.durationMinutes,
      time: userActivity.createdDate!.formatted(.iso8601), notes: userActivity.notes,
      createdDay: dateFormatter.string(from: userActivity.createdDate!))
  }
  // for testing purposes
  var activityPayload: [String: String] {
    var data: [String: String] = [:]
    data["activityName"] = self.userActivity.pathizeUserActivity.activityName
    guard let body = self.getRecordBody() else { return data }
    data["duration"] = body.activityTotalTime!.formatted()
    return data
  }
}
