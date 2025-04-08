#import "AppDelegate.h"
#import <Firebase.h>
#import <TerraiOS/TerraiOS-Swift.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTRootView.h>
#import <IntercomModule.h>
#import <RNFBDynamicLinksAppDelegateInterceptor.h>
#import "RNBootSplash.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  self.moduleName = @"jupiter_mobile";
  self.initialProps = @{};
  // https://github.com/crazycodeboy/react-native-splash-screen/issues/606#issuecomment-1401875339
  bool didFinish=[super application:application didFinishLaunchingWithOptions:launchOptions];
  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:self.window.rootViewController.view];
  // https://github.com/invertase/react-native-firebase/issues/4548#issuecomment-1252028059
  [RNFBDynamicLinksAppDelegateInterceptor sharedInstance];
  [IntercomModule initialize:@"ios_sdk-ff419af12b717bc6ad8e0be12d57ccaa9bf26b62" withAppId:@"j5lku435"]; // Intercom
  [Terra setUpBackgroundDelivery];
  return didFinish;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

// Universal links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

@end
