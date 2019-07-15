import React from 'react';
import { createAppContainer } from 'react-navigation';
import { connect } from 'react-redux';
import { LoggedInUserContext } from './LoggedInUserContext';
import { MainNavigator, UnauthNavigator } from './MainNavigator';
import NavigationService from './NavigationService';
import { ApplicationState } from './store';
import * as AuthStore from './store/Auth';

const Navigation = createAppContainer(MainNavigator);

class AuthCheck extends React.Component<AuthStore.AuthState> {

  public render() {

    const { loggedInUser } = this.props;

    if (loggedInUser) {
      return (
        <LoggedInUserContext.Provider value={loggedInUser}>
          <Navigation ref={(navigatorRef) => { NavigationService.setTopLevelNavigator(navigatorRef); }} />
        </LoggedInUserContext.Provider>
      );
    } else {
      const UnauthNavigation = createAppContainer(UnauthNavigator);
      return (
        <UnauthNavigation ref={(navigatorRef) => { NavigationService.setTopLevelNavigator(navigatorRef); }} />
      );
    }
  }
}

const mapStateToProps = (state: ApplicationState) => (state.auth);
export default connect(mapStateToProps)(AuthCheck);
