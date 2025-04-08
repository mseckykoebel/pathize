//
//  WCManager.m
//  jupiter_mobile
//
//  Created by AJ Hesby on 8/17/23.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <WatchConnectivity/WatchConnectivity.h>
#import <React/RCTBridgeModule.h>
// import Swift implementations using xcode-generated umbrella header
#import "Pathize-Swift.h"

//
// interface declarations
//

NS_ASSUME_NONNULL_BEGIN


#if RCT_NEW_ARCH_ENABLED
#import <AWCManagerSpec/AWCManagerSpec.h>
// WCManager is a subclass so RCTEventEmitter provides some methods
// WCManager is also a WCSessionDelegate and handles the Watch Connectivity session
// Lastly, conforms to WCManagerSwiftDelegate to let Swift emit events
@interface AWCManager : RCTEventEmitter <NativeAWCManagerSpec, WCSessionDelegate, AWCManagerSwiftDelegate>

#else
@interface AWCManager : RCTEventEmitter <RCTBridgeModule, WCSessionDelegate, AWCManagerSwiftDelegate>
#endif
// have a shared instance of this class so that if the constructor is invoked multiple times, both instances point to the same object
+ (AWCManager*) sharedInstance;

//https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjectiveC/Chapters/ocProperties.html#//apple_ref/doc/uid/TP30001163-CH17-SW2

@property (nonatomic, strong) WCSession* session;

@end

NS_ASSUME_NONNULL_END

///
/// implementation declarations
///

// MARK: TURBO MODULE CODE
#ifdef RCT_NEW_ARCH_ENABLED
static AWCManager* sharedInstance;

@implementation AWCManager {
  AWCManagerSwift* awcManagerSwift;
}

RCT_EXPORT_MODULE()

// we must implement this because we override init()
+(BOOL)requiresMainQueueSetup {
  return YES;
}

+(AWCManager *)sharedInstance {
  return sharedInstance;
}

-(instancetype)init{
  sharedInstance = [super init];
  if([WCSession isSupported]){
    WCSession *session = [WCSession defaultSession];
    session.delegate = self;
    self.session = session;
    [session activateSession];
  }
  // instantiate WCManagerSwift object so we can invoke Swift methods from this class
  awcManagerSwift = [AWCManagerSwift new];
  awcManagerSwift.delegate = self;
  
  // constructor should return a sharedInstance
  return sharedInstance;
}

// Emitting Events
- (NSArray<NSString *> *)supportedEvents {
   return [AWCManagerSwift supportedEvents];
}
-(void)emitMessageReceivedNoReplyWithName:(NSString* _Nonnull)name message:(NSDictionary<NSString *,id> * _Nonnull)message {
  [self sendEventWithName:name body:message];
}


// implement required WCSessionDelegate methods

- (void)session:(WCSession *)session
activationDidCompleteWithState:(WCSessionActivationState)activationState
          error:(NSError *)error {
  NSLog(@"%@", @"activation completed");
}
- (void)sessionDidBecomeInactive:(WCSession *)session {
  NSLog(@"%@", @"session became inactive");
}
- (void)sessionDidDeactivate:(WCSession *)session {
   // Begin the activation process for the new Apple Watch.
   [[WCSession defaultSession] activateSession];
}

// WCSessionDelegate methods for data transfer

- (void)session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *,id> *)message {
  // use react native event emitters to notify phone
  NSLog(@"%@", @"iPhone received message!");
  [awcManagerSwift handleReceivedMessageWithMessage:message];
}


//check if WC is supported

-(void)isWCSupported:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  // converts boolean into boxed NSNumber
  // NSNumber* is used to wrap literals in Obj-C:
  //https://clang.llvm.org/docs/ObjectiveCLiterals.html
  NSNumber *result = @([awcManagerSwift isWCSupported]);
  resolve(result);
}

- (void)sendMessage:(NSDictionary *)message {
  [awcManagerSwift sendMessageWithMessage:message];
}

/// MARK: check apple watch reachability and connection

-(void)isPaired:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSNumber *result = @([awcManagerSwift isPaired]);
  resolve(result);
}

-(void)isWatchAppInstalled:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSNumber *result = @([awcManagerSwift isWatchAppInstalled]);
  resolve(result);
}

-(void)isReachable:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSNumber *result = @([awcManagerSwift isReachable]);
  resolve(result);
}



// required for Turbo Native modules

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeAWCManagerSpecJSI>(params);
}

#else
//
// MARK: REGULAR NATIVE MODULE CODE
//
static AWCManager* sharedInstance;

@implementation AWCManager {
  AWCManagerSwift* awcManagerSwift;
}

RCT_EXPORT_MODULE()

// we must implement this because we override init()
+(BOOL)requiresMainQueueSetup {
  return YES;
}

+(AWCManager *)sharedInstance {
  return sharedInstance;
}

-(instancetype)init{
  sharedInstance = [super init];
  if([WCSession isSupported]){
    WCSession *session = [WCSession defaultSession];
    session.delegate = self;
    self.session = session;
    [session activateSession];
  }
  // instantiate WCManagerSwift object so we can invoke Swift methods from this class
  awcManagerSwift = [AWCManagerSwift new];
  awcManagerSwift.delegate = self;
  
  // constructor should return a sharedInstance
  return sharedInstance;
}

// Emitting Events
- (NSArray<NSString *> *)supportedEvents {
   return [AWCManagerSwift supportedEvents];
}
-(void)emitMessageReceivedNoReplyWithName:(NSString* _Nonnull)name message:(NSDictionary<NSString *,id> * _Nonnull)message {
  [self sendEventWithName:name body:message];
}


// implement required WCSessionDelegate methods

- (void)session:(WCSession *)session
activationDidCompleteWithState:(WCSessionActivationState)activationState
          error:(NSError *)error {
  NSLog(@"%@", @"activation completed");
}
- (void)sessionDidBecomeInactive:(WCSession *)session {
  NSLog(@"%@", @"session became inactive");
}
- (void)sessionDidDeactivate:(WCSession *)session {
   // Begin the activation process for the new Apple Watch.
   [[WCSession defaultSession] activateSession];
}

// WCSessionDelegate methods for data transfer

- (void)session:(WCSession *)session
didReceiveMessage:(NSDictionary<NSString *,id> *)message {
  // use react native event emitters to notify phone
  NSLog(@"%@", @"iPhone received message!");
  [awcManagerSwift handleReceivedMessageWithMessage:message];
}


//check if WC is supported

RCT_REMAP_METHOD(isWCSupported, isWCSupportedWithResolver:(RCTPromiseResolveBlock) resolve
                 withRejecter:(RCTPromiseRejectBlock) reject){
  return [self isWCSupported:resolve reject:reject];

}

RCT_EXPORT_METHOD(isWCSupported:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  // converts boolean into boxed NSNumber
  // NSNumber* is used to wrap literals in Obj-C:
  //https://clang.llvm.org/docs/ObjectiveCLiterals.html
  NSNumber *result = @([awcManagerSwift isWCSupported]);
  resolve(result);
}

/// MARK: sending data and application context

RCT_EXPORT_METHOD(sendContextToAppleWatch:(NSDictionary * _Nonnull)context resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject){
  [awcManagerSwift sendContextToAppleWatchWithContext:context resolver:resolve rejecter:reject];
}


RCT_EXPORT_METHOD(sendMessage:(NSDictionary *)message) {
  [awcManagerSwift sendMessageWithMessage:message];
}

/// MARK: check apple watch reachability and connection

RCT_EXPORT_METHOD(isPaired:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject){
  NSNumber *result = @([awcManagerSwift isPaired]);
  resolve(result);
}

RCT_EXPORT_METHOD(isWatchAppInstalled:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject){
  NSNumber *result = @([awcManagerSwift isWatchAppInstalled]);
  resolve(result);
}

RCT_EXPORT_METHOD(isReachable:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  NSNumber *result = @([awcManagerSwift isReachable]);
  resolve(result);
}

RCT_EXPORT_METHOD(startActivity){
  [awcManagerSwift startActivity];
}


#endif
@end

