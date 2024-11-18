
// #import "AppDelegate.h"
// #import <FirebaseCore/FirebaseCore.h>
// #import <React/RCTBundleURLProvider.h>
// #import <UserNotifications/UserNotifications.h>
// #import <RNCPushNotificationIOS.h>

// @implementation AppDelegate

// - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
// {
//   self.moduleName = @"ReactNative";
//   self.initialProps = @{};

//   [FIRApp configure];

//   UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
//   center.delegate = self;
//   [application registerForRemoteNotifications];

//   return [super application:application didFinishLaunchingWithOptions:launchOptions];
// }

// - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
// {
//   return [self getBundleURL];
// }

// - (NSURL *)getBundleURL
// {
// #if DEBUG
//   return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
// #else
//   return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
// #endif
// }

// - (void)userNotificationCenter:(UNUserNotificationCenter *)center
//        willPresentNotification:(UNNotification *)notification
//          withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
// {
//   completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
// }

// - (void)application:(UIApplication *)application
// didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
// {
//   [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
// }

// - (void)application:(UIApplication *)application
// didReceiveRemoteNotification:(NSDictionary *)userInfo
// fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
// {
//   [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
// }

// - (void)application:(UIApplication *)application
// didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
// {
//   [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
// }

// - (void)userNotificationCenter:(UNUserNotificationCenter *)center
// didReceiveNotificationResponse:(UNNotificationResponse *)response
//          withCompletionHandler:(void (^)(void))completionHandler
// {
//   [RNCPushNotificationIOS didReceiveNotificationResponse:response];
//   completionHandler();
// }

// @end
#import "AppDelegate.h"
#import <FirebaseCore/FirebaseCore.h>
#import <React/RCTBundleURLProvider.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.moduleName = @"ReactNative";
    self.initialProps = @{};

    // Initialize Firebase
    if ([FIRApp defaultApp] == nil) {
        [FIRApp configure];
    }

    // Set up notification center delegate and request permissions
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                          completionHandler:^(BOOL granted, NSError * _Nullable error) {
                              if (granted) {
                                  dispatch_async(dispatch_get_main_queue(), ^{
                                      [application registerForRemoteNotifications];
                                  });
                              }
                          }];
    
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
    return [self getBundleURL];
}

- (NSURL *)getBundleURL {
#if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Handle notifications when app is in foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
    completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

// Firebase Auth notification forwarding (for manual handling if swizzling disabled)
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    if ([FIRAuth.auth canHandleNotification:userInfo]) {
        return;
    }
    [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response
          withCompletionHandler:(void (^)(void))completionHandler {
    [RNCPushNotificationIOS didReceiveNotificationResponse:response];
    completionHandler();
}

@end
