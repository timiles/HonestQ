import React from 'react';
import { HQContentView, HQHeader, HQSubmitButton } from '../../hq-components';
import hqStyles from '../../hq-styles';
import NavigationService from '../../NavigationService';

export default class UnauthScreen extends React.Component {

  public render() {
    return (
      <HQContentView style={hqStyles.center}>
        <HQHeader>HonestQ</HQHeader>
        <HQSubmitButton title="Log in" onPress={this.navigateToLogIn} />
        <HQSubmitButton title="Sign up" onPress={this.navigateToSignUp} />
      </HQContentView>
    );
  }

  private navigateToLogIn() {
    NavigationService.navigate('LogIn');
  }

  private navigateToSignUp() {
    NavigationService.navigate('SignUp');
  }
}
