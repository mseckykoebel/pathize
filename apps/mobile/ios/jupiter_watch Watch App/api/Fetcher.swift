//
//  Fetcher.swift
//  jupiter_watch Watch App
//
//  Created by AJ Hesby on 8/29/23.
//

import Foundation

class Fetcher {
  var activityManager: ActivityManager
  var environment: AppEnvironmentType
  var baseURL: String

  // credentials:
  // 'userId' : userId (String)
  // 'jwt' : jwt (String)
  var credentials: [String: String]? {
    didSet {
      if credentials != nil && self.activityManager.syncingStatus == .waitingForCredentials {
        self.activityManager.syncingStatus = .inProgress
      }
    }
  }
  @Published var activitiesReceived: Set<PathizeUserActivity> = Set<PathizeUserActivity>.init() {
    didSet {
      activityManager.pathizeUserActivities = activitiesReceived
    }
  }
  @Published var baselineReceived: Double? {
    didSet {
      guard let baseline = baselineReceived else { return }
      activityManager.heartRateLimit = baseline
    }
  }
  var userId: String? {
    guard let creds = credentials else { return nil }
    return creds["userId"]
  }
  var jwtToken: String? {
    guard let creds = credentials else { return nil }
    return creds["jwt"]
  }

  enum FetcherError: Error {
    case invalidURL
    case serverError
    case parseError
    case timeout
    case code403
    case code404Activities
    case code404Limit
    case code500Activities
    case code500Limit
  }
  enum FetcherSuccess {
    case success
    case successButEmpty
  }
  init(activityManager: ActivityManager, environmentType env: AppEnvironmentType) {
    self.activityManager = activityManager
    self.environment = env
    switch env {
    case .development:
      self.baseURL = "http://localhost:3000"
    case .staging:
      self.baseURL = "https://jupiter-api-staging.fly.dev"
    case .production:
      self.baseURL = "https://jupiter-api.fly.dev"
    }
    print("Set Fetcher baseURL to \(baseURL)")
  }
  func fetch(
    url: String,
    options: [String: Any]? = nil,
    completion: @escaping (Result<Any, FetcherError>) -> Void
  ) {
    print("\(#function) -> fetching with options: \(String(describing: options))")
  }
  func performUpdates(
    withCompletion completion: @escaping (Result<FetcherSuccess, FetcherError>) -> Void
  ) {
    self.updateUserBaseline { result in
      switch result {
      case .success:
        self.updateUserActivities { result in
          switch result {
          case .success:
            completion(.success(.success))
            break
          case .failure(let error):
            print("failed to get activities")
            if error == .code403 {
              completion(.failure(.code403))
            } else if error == .code404Activities {
              completion(.failure(.code404Activities))
            } else if error == .code500Activities {
              completion(.failure(.code500Activities))
            } else {
              completion(.failure(.serverError))
            }
          }
        }
        break
      case .failure(let error):
        print("failed to get baseline")
        if error == .code403 {
          completion(.failure(.code403))
        } else if error == .code404Limit {
          completion(.failure(.code404Limit))
        } else if error == .code500Limit {
          completion(.failure(.code500Limit))
        } else {
          completion(.failure(.serverError))
        }
      }
    }
  }

  // MARK: create activity record with PathizeActivityRecordBody
  func createActivityRecord(
    withBody body: PathizeActivityRecordBody,
    withCompletion completion: @escaping (Result<FetcherSuccess, FetcherError>) -> Void
  ) {
    guard userId != nil && jwtToken != nil else {
      print("credentials  were null")
      completion(.failure(.parseError))
      return
    }
    guard
      let url = URL(
        string: self.baseURL + "/api/v1/createActivityRecord?userId=\(userId!)&platform=apple_watch"
      )
    else {
      print("invalid url provided in Fetcher.\(#function)")
      return
    }

    var request = URLRequest(
      url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 10)
    request.httpMethod = "POST"
    request.setValue("Bearer \(jwtToken!)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    // if successful
    do {
      let json_obj = try JSONEncoder().encode(body)
      request.httpBody = json_obj
    } catch let error {
      completion(.failure(.parseError))
      print("\(error)")
    }
    let task = URLSession.shared.dataTask(with: request) { data, response, err in
      print(String(describing: request.httpBody))
      guard err == nil else {
        completion(.failure(.serverError))
        return
      }
      completion(.success(.success))
    }
    task.resume()
  }
  // MARK: create activity record with Data object (JSON serialized PathizeActivityRecordBody)
  func createActivityRecord(
    withData recordData: Data,
    withCompletion completion: @escaping (Result<FetcherSuccess, FetcherError>) -> Void
  ) {
    guard userId != nil && jwtToken != nil else { return }
    guard let url = URL(string: self.baseURL + "/api/v1/createActivityRecord?userId=\(userId!)")
    else {
      print("invalid url provided in Fetcher.\(#function)")
      return
    }

    var request = URLRequest(
      url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 10)
    request.httpMethod = "POST"
    request.setValue("Bearer \(jwtToken!)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    // if successful
    request.httpBody = recordData
    let task = URLSession.shared.dataTask(with: request) { data, response, err in
      print(String(describing: request.httpBody))
      guard err == nil else {
        completion(.failure(.serverError))
        return
      }
      completion(.success(.success))
    }
    task.resume()
  }

  // Fetch and update user activities
  func updateUserActivities(
    withCompletion completion: @escaping (Result<FetcherSuccess, FetcherError>) -> Void
  ) {
    print("fetching user activities...")
    var userActivities: [PathizeUserActivity] = []
    guard userId != nil && jwtToken != nil else { return }
    guard let url = URL(string: self.baseURL + "/api/v1/getUserActivities?userId=\(userId!)") else {
      print("invalid url provided in Fetcher.\(#function)")
      return
    }
    var request = URLRequest(
      url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
    guard jwtToken != nil else {
      completion(.failure(.parseError))
      return
    }
    request.httpMethod = "GET"
    request.setValue("Bearer \(jwtToken!)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let task = URLSession.shared.dataTask(with: request) { data, response, err in

      // check response status code
      let httpResponse = response as? HTTPURLResponse
      let code = httpResponse?.statusCode as? Int
      switch code {
      case 404:
        print(
          "404 code received, indicating there are no activities but fetcher was successful.")
        DispatchQueue.main.async {
          self.activitiesReceived = Set()
          completion(.failure(.code404Activities))
        }
      case 403:
        DispatchQueue.main.async {
          completion(.failure(.code403))
        }
      case 500:
        DispatchQueue.main.async {
          completion(.failure(.code500Activities))
        }
      default:
        break
      }
      if [404, 403, 500].contains(code) {
        print("code is in set so return")
        return
      }

      guard let data = data else {
        completion(.failure(.parseError))
        print("data is nil")
        return
      }
      do {
        print("user activities response: \(String(describing: response))")
        guard
          let values = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
            as? [String: Any]
        else {
          print("failed to serialize activities")
          completion(.failure(.parseError))
          return
        }
        //          if let activities = values["data"] as? [[String:Any]] {
        //            print("\(String(describing: activities))")
        //          }
        print("activity values: \(values)")
        guard let value_data = values["data"] else {
          DispatchQueue.main.async {
            completion(.failure(.serverError))
          }
          return
        }

        let activityData = try JSONSerialization.data(withJSONObject: value_data, options: [])
        userActivities = try JSONDecoder().decode([PathizeUserActivity].self, from: activityData)
        // refactor to use completion handler
        DispatchQueue.main.async {
          self.activitiesReceived = Set(userActivities)
          completion(.success(.success))
        }

      } catch let error {
        completion(.failure(.serverError))
        print("Error: \(error)")
      }

      // print("Response: \(String(describing: response))")

    }
    task.resume()
  }

  // Fetch and update user baseline
  func updateUserBaseline(
    withCompletion completion: @escaping (Result<FetcherSuccess, FetcherError>) -> Void
  ) {
    print("getting user baseline...")
    // the first argument in the returned result is the baseline
    guard userId != nil && jwtToken != nil else {
      completion(.failure(.parseError))
      return
    }
    guard let url = URL(string: self.baseURL + "/api/v1/getTargets?userId=\(userId!)") else {
      print("invalid url provided in Fetcher.\(#function)")
      completion(.failure(.parseError))
      return
    }
    var request = URLRequest(
      url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
    guard jwtToken != nil else {
      completion(.failure(.parseError))
      return
    }
    request.httpMethod = "GET"
    request.setValue("Bearer \(jwtToken!)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let task = URLSession.shared.dataTask(with: request) { data, response, err in

      // check response status code
      let httpResponse = response as? HTTPURLResponse
      let code = httpResponse?.statusCode as? Int
      switch code {
      case 404:
        print(
          "404 code received, indicating there is no limit set but fetcher was successful.")
        DispatchQueue.main.async {
          completion(.failure(.code404Limit))
        }
      case 403:
        DispatchQueue.main.async {
          completion(.failure(.code403))
        }
      case 500:
        DispatchQueue.main.async {
          completion(.failure(.code500Limit))
        }
      default:
        break
      }
      if [404, 403, 500].contains(code) {
        print("code is in set so return")
        return
      }

      if let data = data {

        do {
          if let values = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
            as? [[String: Any]]
          {
            print("\(values)")
            guard let target = values[0]["target"] as? String else {
              print("failed to set baseline")
              completion(.failure(.parseError))
              return
            }
            // refactor to use completion handler
            DispatchQueue.main.async {
              self.baselineReceived = Double(target)
              print("baseline received: \(String(describing: self.baselineReceived))")
              completion(.success(.success))
            }
          }

        } catch let error {
          completion(.failure(.serverError))
          print(error)
        }
      }
    }
    task.resume()
  }
}
