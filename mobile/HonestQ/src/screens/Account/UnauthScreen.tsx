import React from 'react';
import { ImageBackground, ImageStyle, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { HQSubmitButton } from '../../hq-components';
import hqStyles from '../../hq-styles';
import NavigationService from '../../NavigationService';
import ThemeService from '../../ThemeService';

export default class UnauthScreen extends React.Component {

  public render() {
    // Let's make unauth always be light theme for now
    if (ThemeService.getTheme() !== 'light') {
      ThemeService.setTheme('light');
    }

    // Important that the require id is statically known for the packager
    const natureBackground = require('./assets/light-nature.png');
    const stepOutStyle = styles.stepOutStyle;
    const echoChamberStyle = styles.echoChamberStyle;
    const leadStyle = styles.leadStyle;

    return (
      <View style={[ThemeService.getStyles().contentView, hqStyles.flex1]}>
        <ImageBackground
          source={natureBackground}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={[hqStyles.flexGrow, hqStyles.center, styles.centerItems]}>
            <Text style={stepOutStyle}>Step out of your</Text>
            <Text style={echoChamberStyle}>echo chamber</Text>
            <View style={hqStyles.p3}>
              <Text style={[leadStyle, hqStyles.mb1]}>
                HonestQ is a Q&amp;A site based on freedom of speech, critical thinking, and citing your sources.
              </Text>
              <Text style={leadStyle}>
                Find out how people can disagree, honestly.
              </Text>
            </View>
            <View style={hqStyles.flexRow}>
              <HQSubmitButton title="Log in" onPress={this.navigateToLogIn} />
              <HQSubmitButton title="Sign up" onPress={this.navigateToSignUp} style={hqStyles.ml1} />
            </View>
          </View>
        </ImageBackground>
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

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
  } as ViewStyle,

  backgroundImage: {
    resizeMode: 'contain',
  } as ImageStyle,

  centerItems: {
    alignItems: 'center',
  } as ViewStyle,

  stepOutStyle: {
    color: '#28374B',
    fontFamily: 'Nexa Bold',
    fontSize: 28,
  } as TextStyle,

  echoChamberStyle: {
    color: '#007BFF',
    fontFamily: 'Nexa Bold',
    fontSize: 34,
  } as TextStyle,

  leadStyle: {
    color: '#616F7F',
    fontFamily: 'lineto-circular-book',
    fontSize: 20,
    textAlign: 'center',
  } as TextStyle,
});
