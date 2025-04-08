/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TurboModule } from "react-native/Libraries/TurboModule/RCTExport";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  // check whether watch connectivity is supported
  // note, even though we are returning a bool, it is actually NSNumber*
  // thus, we must use Promise<number>. Promise<boolean>, for instance, will lead to errors
  isWCSupported(): Promise<number>;

  // checks whether a watch is paired
  isPaired(): Promise<number>;

  // checks whether the associated watch app is installed
  isWatchAppInstalled(): Promise<number>;

  // checks whether the watch is currently reachable (required for sendMessage)
  isReachable(): Promise<number>;

  // send a message
  // indexed object type annotation for dictionary (note, 'any' type is not allowed by codegen)
  // see the following: https://reactnative.dev/docs/native-modules-ios#argument-types
  sendMessage(
    message:
      | {
          [key: string]: Record<string, string | unknown> | string;
        }
      | string
      | null
  ): void;

  // starts an activity on apple watch using HKHealthStore.startWatchApp
  startActivity(): void;

  // sends context to apple watch containing userId and JWT accessToken
  sendContextToAppleWatch(message: {
    userId: string;
    accessToken: string;
    [key: string]: Record<string, string | unknown> | string;
  }): Promise<string>;

  // implementations are provided by RCTEventEmitter itself
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.get<Spec>("AWCManager") as Spec | null;
