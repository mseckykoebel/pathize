//
//  PathizeActivityRecord.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/29/23.
//

import Foundation

struct PathizeActivityRecord {

  let id: String
  let userId: String
  let activityIcon: String
  let activityName: String
  let activityPriority: Int?
  // in MINUTES:
  let activityTotalTime: Int?
  // can ignore exertions for now
  let activityPhysicalExertion: Int?
  let activityCognitiveExertion: Int?
  let activityEmotionalExertion: Int?
  // LOCAL time created:
  let time: String
  let notes: String?
  // day created in LOCAL TIME:
  let createdDay: String
  // UTC timestamp:
  let createdAt: Date
  let updatedAt: Date?

}

// used for api requests to create a new activity record
struct PathizeActivityRecordBody: Codable {
  let userId: String
  let userActivityId: String
  let activityIcon: String
  let activityName: String
  let activityPriority: Int?
  // in MINUTES:
  let activityTotalTime: Int?
  // LOCAL time created:
  let time: String
  let notes: String?
  // day created in LOCAL TIME:
  let createdDay: String
}

extension PathizeActivityRecordBody {
  init(usingDictionary dict: [String: Any]) {
    userId = dict["userId"] as? String ?? ""
    userActivityId = dict["userActivityId"] as? String ?? ""
    activityIcon = dict["activityIcon"] as? String ?? ""
    activityName = dict["activityName"] as? String ?? ""
    activityPriority = dict["activityPriority"] as? Int ?? nil
    activityTotalTime = dict["activityTotalTime"] as? Int ?? nil
    time = dict["time"] as? String ?? ""
    notes = dict["notes"] as? String ?? nil
    createdDay = dict["createdDay"] as? String ?? ""
  }
  func toDict() -> [String: Any] {
    var dict = [String: Any]()
    let otherSelf = Mirror(reflecting: self)
    for child in otherSelf.children {
      if let key = child.label {
        dict[key] = child.value
      }
    }
    return dict
  }
}
