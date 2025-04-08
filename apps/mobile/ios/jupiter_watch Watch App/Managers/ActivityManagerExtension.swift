//
//  ActivityManagerExtension.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 9/13/23.
//

import Foundation
import SwiftUI

// MARK: - Syncing Status

extension ActivityManager {

  enum SyncingStatus {
    case initialStart
    case inProgress
    case waitingForCredentials
    case successful
    case failed
    case needCredentialsFromPhone
    case timedOut
    case code403
    case code404Activities
    case code404Limit
    case code500Activities
    case code500Limit
  }
  func syncActivitiesAndLimit() {
    // include code to time this out if it takes too long. currently, timeout is 30 seconds
    var canTimeOut = true
    DispatchQueue.main.asyncAfter(deadline: .now() + DispatchTimeInterval.seconds(30)) {
      if canTimeOut {
        print("timed out")
        self.syncingStatus = .timedOut
        return
      }
    }
    guard self.syncingStatus != .inProgress else {
      print("Already syncing")
      return
    }

    print("getting credentials...")
    self.connectivityManager.updateFromContext { result in
      switch result {
      case .success:
        print("syncing...")
        DispatchQueue.main.async {
          self.syncingStatus = .inProgress
        }
        self.fetcher?.performUpdates { result in
          switch result {
          case .success:
            DispatchQueue.main.async {
              self.syncingStatus = .successful
            }
            print("uploading any saved activities...")
            self.uploadSavedActivities()
            canTimeOut = false
            break
          case .failure(let error):
            DispatchQueue.main.async {
              switch error {
              case .code403:
                self.syncingStatus = .code403
              case .code404Activities:
                self.syncingStatus = .code404Activities
              case .code404Limit:
                self.syncingStatus = .code404Limit
              case .code500Activities:
                self.syncingStatus = .code500Activities
              case .code500Limit:
                self.syncingStatus = .code500Limit
              default:
                self.syncingStatus = .failed
              }
              canTimeOut = false
            }
          }
        }
      case .failure:
        print("Sending message for credentials")
        self.connectivityManager.sendMessage([
          "credentialsRequest": "watch is requesting credentials"
        ])
        DispatchQueue.main.async {
          self.syncingStatus = .needCredentialsFromPhone
        }
      }
    }
  }
  func getCredentials() {
    // sends a message that will wake up the phone if it is not active
    print("sending a message in order to get credentials")
    self.connectivityManager.sendMessage(["credentialsRequest": "Watch is requesting credentials"])
  }
  func uploadSavedActivities() {

    print("Attempting to upload data")
    var failedRecords: [Data] = []
    let localRecordData = self.storageManager.getExistingRecordData()
    if localRecordData.count > 0 {
      for recordData in localRecordData {
        self.fetcher?.createActivityRecord(withData: recordData) { result in
          switch result {
          case .success:
            print("Success")
          case .failure:
            print("Failure")
            failedRecords.append(recordData)

          }
        }
      }
    } else {
      print("no local data to send")
    }
    // re-save any records that failed to upload
    if failedRecords.count > 0 {
      print(
        "Re-saving the following records that failed to upload: \(String(describing: failedRecords))"
      )
      self.storageManager.savePathizeTrackedActivities(usingDataList: failedRecords)
    } else {
      print("No records to re-save.")
    }
  }

}

// MARK: - other
