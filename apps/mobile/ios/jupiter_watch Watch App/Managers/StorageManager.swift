//
//  StorageManager.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/29/23.
//

import Foundation

class StorageManager {

  // singleton pattern
  static let shared = StorageManager()
  private init() {
    // fetch from storage
  }

  func savePathizeTrackedActivity(usingRecordBody record: PathizeActivityRecordBody) {
    var existingData = self.getExistingRecordData()
    if let newData = self.serializeRecord(usingRecord: record) {
      existingData.append(newData)
      self.savePathizeTrackedActivities(usingDataList: existingData)
    }
  }
  func serializeRecord(usingRecord record: PathizeActivityRecordBody) -> Data? {
    do {
      let recordData = try JSONEncoder().encode(record)
      return recordData
    } catch let error {
      print("There was an error: \(String(describing: error))")
    }
    return nil
  }
  func savePathizeTrackedActivities(usingDataList dataList: [Data]) {
    // save tracked activities to local storage
    let userDefaults = UserDefaults.init()
    userDefaults.setValue(dataList, forKey: "PathizeActivityRecordBodies")
    print("locally saved data")

  }
  func getExistingRecordData() -> [Data] {
    let userDefaults = UserDefaults.init()
    guard let dataList = userDefaults.array(forKey: "PathizeActivityRecordBodies") as? [Data] else {
      return []
    }
    return dataList
  }
  func retrievePathizeTrackedActivities() -> [PathizeActivityRecordBody] {
    let existingData = self.getExistingRecordData()
    var existingRecords: [PathizeActivityRecordBody] = []
    for dataRecord in existingData {
      do {
        let record = try JSONDecoder().decode(PathizeActivityRecordBody.self, from: dataRecord)
        existingRecords.append(record)
      } catch let error {
        print("There was an error: \(String(describing: error))")
      }
    }
    return existingRecords
  }

  // get the saved vibrationDelay, if any. Returns 0 if there is nothing saved

  func getVibrationDelay() -> Int {
    let userDefaults = UserDefaults.init()
    return userDefaults.integer(forKey: "VibrationDelay")
  }

  // save vibrationDelay to local storage
  func saveVibrationDelay(_ vibrationDelay: Int) {
    let userDefaults = UserDefaults.init()
    userDefaults.set(vibrationDelay, forKey: "VibrationDelay")
  }
}
