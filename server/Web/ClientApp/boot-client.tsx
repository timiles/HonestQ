import 'bootstrap';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactGA from 'react-ga';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import configureStore from './configureStore';
import './css/site.css';
import * as RoutesModule from './routes';
import { ApplicationState } from './store';
let routes = RoutesModule.routes;

// Create browser history to use in the Redux store
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href')!;
const history = createBrowserHistory({ basename: baseUrl });

// Get the application-wide store instance, prepopulating with state from the server where available.
const initialState = (window as any).initialReduxState as ApplicationState;
const store = configureStore(history, initialState);

function renderApp() {
  // TODO: Use .env instead? Couldn't get it working...
  const googleAnalyticsTrackingCode = (window.location.host === 'www.honestq.com') ? 'UA-128648766-2' : null;
  if (googleAnalyticsTrackingCode) {
    ReactGA.initialize(googleAnalyticsTrackingCode);
    const loggedInUser = store.getState().login.loggedInUser;
    if (loggedInUser) {
      ReactGA.set({ userId: loggedInUser.id });
    }
    ReactGA.pageview(window.location.pathname + window.location.search);
    history.listen((location, action) => {
      // Track all actions: PUSH, POP, REPLACE
      ReactGA.pageview(location.pathname + location.search);
    });
  }

  // This code starts up the React app when it runs in a browser. It sets up the routing configuration
  // and injects the app into a DOM element.
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <ConnectedRouter history={history} children={routes} />
      </Provider>
    </AppContainer>,
    document.getElementById('react-app'),
  );
}

renderApp();

// Allow Hot Module Replacement
if (module.hot) {
  module.hot.accept('./routes', () => {
    routes = require<typeof RoutesModule>('./routes').routes;
    renderApp();
  });
}
