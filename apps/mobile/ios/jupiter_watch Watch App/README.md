# Apple Watch

## First time setup

1. In VSCode (or another code editor), starting from the root directory (`pathize/`): `cd apps/mobile && yarn add ../../packages/awcmanager` adds the react native module `awcmanager` to the mobile workspace as a dependency.
2. From `mobile/`, `cd ios && pod install` installs awcmanager as a pod dependency.
3. In Xcode, we need to pair an iPhone simulator to an Apple watch in order to test the watch app. Click the middle-top bar in Xcode where the simulator model is listed, (e.g. `Apple Watch Series 8 (41 mm)`),
followed by `Manage run destinations....`. Click `Simulators` in the top left. Click the `+` icon in the bottom left, and after choosing an iPhone model and associated iOS version, name this simulator `Paired phone`. It is important to use this *exact* name so that yarn commands work in later steps. After clicking create, select this simulator in the menu on the left. You will see a header named `Paired Watches`. Clicking plus in this window allows you to add a paired watch. Following similar steps, name this simulator `Paired watch`. After doing so, you should see it listed under the `Paired Watches` header.

4. Return to VSCode. Make sure you are in the `mobile` directory, and run `yarn ios_paired`. This will build the iOS app onto the simulator you have named `Paired phone`. Ensure the phone app builds properly and functions before proceeding.

5. Now we can build the watch app. It is crucial that the phone app has built successfully prior to this (at least, on initial setup) to avoid pairing issues. Return to Xcode. Select the same middle-top bar as before, revealing a list of simulators to pick from. If the phone built successfully, and is paired to a watch named `Paired watch`, you should now see a new run destination: `Paired watch via Paired phone`. Building to this run destination is necessary in order for the watch and phone to be paired. Build to this destination now. There is no need to close out of the phone simulator that you have just built to from VSCode; in fact, doing so may cause pairing troubles in Xcode.

6. If the watch builds successfully, the watch app will be launched automatically, and the phone app will be closed, with a blue dot next to its name to designate the build has been updated. If the apple watch does not appear to be syncing properly, click to the home screen on the apple watch and check to see if it has no connection to the phone. (You will see a small red phone icon with a slash through it.) In this case, a full rebuild (building to phone first from VSCode, then `Paired watch via Paired phone` from Xcode), is often required to regain connection.
