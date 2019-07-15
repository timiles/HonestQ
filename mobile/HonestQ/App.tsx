import { Notifications } from 'expo';
import * as Font from 'expo-font';
import { EventSubscription } from 'fbemitter';
import React from 'react';
import FlashMessage, { DefaultFlash, MessageComponentProps } from 'react-native-flash-message';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore, DeepPartial, Store } from 'redux';
import thunk from 'redux-thunk';
import AuthCheck from './src/AuthCheck';
import { HQContentView } from './src/hq-components';
import hqStyles from './src/hq-styles';
import { localStoreMiddleware, loggedInUserStorageKey } from './src/localStoreMiddleware';
import { LoggedInUserModel } from './src/server-models';
import * as StoreModule from './src/store';
import { handleNotification, registerForPushNotificationsAsync } from './src/utils/notification-utils';
import { getData } from './src/utils/storage-utils';

interface State {
  assetsLoaded: boolean;
  authLoaded: boolean;
  loggedInUser?: LoggedInUserModel;
}

export default class App extends React.Component<{}, State> {

  private handleNotification: EventSubscription;
  private store: Store<StoreModule.ApplicationState>;

  public constructor(props: {}) {
    super(props);

    this.state = { assetsLoaded: false, authLoaded: false };
  }

  public async componentDidMount() {
    registerForPushNotificationsAsync();

    if (!this.handleNotification) {
      this.handleNotification = Notifications.addListener(handleNotification);
    }

    getData(loggedInUserStorageKey,
      (loggedInUser) => {
        this.setState({ authLoaded: true, loggedInUser });
      });

    await Font.loadAsync({
      'lineto-circular-book': require('./assets/fonts/lineto-circular-book.ttf'),
      'Nexa Bold': require('./assets/fonts/Nexa_Bold.otf'),
    });

    this.setState({ assetsLoaded: true });
  }

  public render() {
    const { assetsLoaded, authLoaded, loggedInUser } = this.state;

    if (!assetsLoaded || !authLoaded) {
      return <HQContentView />;
    }

    if (!this.store) {
      const initialState: DeepPartial<StoreModule.ApplicationState> = { auth: { loggedInUser } };
      const allReducers = combineReducers<StoreModule.ApplicationState>(StoreModule.reducers);
      this.store = createStore(allReducers, initialState, applyMiddleware(thunk, localStoreMiddleware));
    }

    const hqFlashMessageComponent: React.SFC<MessageComponentProps> = (props) =>
      <DefaultFlash {...props} titleStyle={hqStyles.pr1} textStyle={hqStyles.pr1} />;

    return (
      <HQContentView>
        <Provider store={this.store}>
          <AuthCheck />
        </Provider>
        <FlashMessage position="top" MessageComponent={hqFlashMessageComponent} />
      </HQContentView>
    );
  }
}
