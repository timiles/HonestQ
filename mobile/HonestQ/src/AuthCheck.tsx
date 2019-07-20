import React from 'react';
import { createAppContainer } from 'react-navigation';
import { connect } from 'react-redux';
import { LoggedInUserContext } from './LoggedInUserContext';
import { createMainNavigator, UnauthNavigator } from './MainNavigator';
import NavigationService from './NavigationService';
import { ApplicationState } from './store';
import * as AuthStore from './store/Auth';
import * as ThemeSettingStore from './store/ThemeSetting';

class AuthCheck extends React.Component<AuthStore.AuthState & ThemeSettingStore.ThemeSettingState> {

  public componentDidUpdate(prevProps: ThemeSettingStore.ThemeSettingState) {
    if (prevProps.theme !== this.props.theme) {
      // Update must have been caused by changing the Settings page, so navigate back there.
      NavigationService.navigate('Settings');
    }
  }

  public render() {

    // This might not be the most efficient so make sure we only do it when LoggedInUser or Theme changes
    const Navigation = createAppContainer(createMainNavigator());
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

const mapStateToProps = (state: ApplicationState) => ({ ...state.auth, ...state.themeSetting });
export default connect(mapStateToProps)(AuthCheck);
