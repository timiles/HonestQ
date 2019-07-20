import { Notifications, SplashScreen } from 'expo';
import * as Font from 'expo-font';
import React from 'react';
import FlashMessage, { DefaultFlash, MessageComponentProps } from 'react-native-flash-message';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore, DeepPartial, Store } from 'redux';
import thunk from 'redux-thunk';
import AuthCheck from './src/AuthCheck';
import hqStyles from './src/hq-styles';
import { localStoreMiddleware, loggedInUserStorageKey, themeStorageKey } from './src/localStoreMiddleware';
import { LoggedInUserModel } from './src/server-models';
import * as StoreModule from './src/store';
import ThemeService, { Theme } from './src/ThemeService';
import { handleNotification, registerForPushNotificationsAsync } from './src/utils/notification-utils';
import { getData } from './src/utils/storage-utils';

interface State {
  isReady: boolean;
}

export default class App extends React.Component<{}, State> {

  private store: Store<StoreModule.ApplicationState>;

  public constructor(props: {}) {
    super(props);

    SplashScreen.preventAutoHide();

    this.state = { isReady: false };

    registerForPushNotificationsAsync();
    Notifications.addListener(handleNotification);
  }

  public async componentDidMount() {

    const loadThemePromise = new Promise<Theme>(
      (resolve) => getData(themeStorageKey, resolve));

    const loadLoggedInUserPromise = new Promise<LoggedInUserModel>(
      (resolve) => getData(loggedInUserStorageKey, resolve));

    const loadFontsPromise = Font.loadAsync({
      'lineto-circular-book': require('./assets/fonts/lineto-circular-book.ttf'),
      'Nexa Bold': require('./assets/fonts/Nexa_Bold.otf'),
    });

    const loggedInUser = await loadLoggedInUserPromise;
    const theme = (await loadThemePromise) || 'light';
    ThemeService.setTheme(theme);
    const initialState: DeepPartial<StoreModule.ApplicationState> = { auth: { loggedInUser }, themeSetting: { theme } };
    const allReducers = combineReducers<StoreModule.ApplicationState>(StoreModule.reducers);
    this.store = createStore(allReducers, initialState, applyMiddleware(thunk, localStoreMiddleware));

    await loadFontsPromise;

    this.setState({ isReady: true });
  }

  public render() {
    const { isReady } = this.state;

    if (!isReady) {
      // BEWARE: Cannot use any Theme styles until isReady is true!
      // TODO: pre-isReady styling
      return null;
    }

    const hqFlashMessageComponent: React.SFC<MessageComponentProps> = (props) =>
      <DefaultFlash {...props} titleStyle={hqStyles.pr1} textStyle={hqStyles.pr1} />;

    SplashScreen.hide();

    return (
      <Provider store={this.store}>
        <AuthCheck />
        <FlashMessage position="top" MessageComponent={hqFlashMessageComponent} />
      </Provider>
    );
  }
}
