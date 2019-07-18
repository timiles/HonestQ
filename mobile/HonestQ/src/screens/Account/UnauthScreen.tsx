import React from 'react';
import { View } from 'react-native';
import { HQHeader, HQSubmitButton } from '../../hq-components';
import hqStyles from '../../hq-styles';
import NavigationService from '../../NavigationService';

export default class UnauthScreen extends React.Component {

  public render() {
    return (
      <View style={[hqStyles.contentView, hqStyles.center]}>
        <HQHeader>HonestQ</HQHeader>
        <HQSubmitButton title="Log in" onPress={this.navigateToLogIn} />
        <HQSubmitButton title="Sign up" onPress={this.navigateToSignUp} />
      </View>
    );
  }

  private navigateToLogIn() {
    NavigationService.navigate('LogIn');
  }

  private navigateToSignUp() {
    NavigationService.navigate('SignUp');
  }
}
