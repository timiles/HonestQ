import React from 'react';
import { createAppContainer } from 'react-navigation';
import { connect } from 'react-redux';
import { LoggedInUserContext } from './LoggedInUserContext';
import { createMainNavigator, UnauthNavigator } from './MainNavigator';
import NavigationService from './NavigationService';
import { ApplicationState } from './store';
import * as ThemeSettingStore from './store/ThemeSetting';

const mapStateToProps = (state: ApplicationState) => ({ ...state.auth, ...state.themeSetting });
type StateProps = ReturnType<typeof mapStateToProps>;

class AuthCheck extends React.Component<StateProps> {

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

export default connect<StateProps>(mapStateToProps)(AuthCheck);
