import {Linking} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

export async function viewWebPage(domain: string, subdomain?: string) {
  try {
    // first, close the browser
    InAppBrowser.close();
    const url = `${domain}/${subdomain ? subdomain : ''}`;
    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.open(url, {
        dismissButtonStyle: 'close',
        preferredBarTintColor: '#001325',
        preferredControlTintColor: '#FDF8F1',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        showTitle: true,
        toolbarColor: '#001325',
        secondaryToolbarColor: 'black',
        navigationBarColor: 'black',
        navigationBarDividerColor: 'white',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
      });
    } else {
      Linking.openURL(url);
    }
  } catch (e) {
    console.log(e);
  }
}
