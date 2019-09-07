import { Linking } from 'expo';
import React from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../../components/KeyboardPaddedScrollView';
import { HQHeader, HQNavigationButton, HQSubmitButton, HQText, HQTextInput } from '../../hq-components';
import hqStyles from '../../hq-styles';
import NavigationService from '../../NavigationService';
import { SignUpFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as SignUpStore from '../../store/SignUp';
import ThemeService from '../../ThemeService';

type Props = SignUpStore.SignUpState
  & typeof SignUpStore.actionCreators;

class SignUpScreen extends React.Component<Props, SignUpFormModel & { confirmPassword?: string }> {

  constructor(props: Props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentWillUnmount() {
    this.props.reset();
  }

  public render() {
    const { submitting = false, submitted, error } = this.props;
    const { username, password, confirmPassword, email } = this.state;

    return (
      <KeyboardPaddedScrollView
        style={ThemeService.getStyles().contentView}
        contentContainerStyle={[hqStyles.p1, hqStyles.fillSpace, hqStyles.center]}
      >
        <HQHeader style={hqStyles.mb1}>Sign up to HonestQ</HQHeader>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        <HQTextInput
          containerStyle={hqStyles.mb1}
          autoCapitalize="none"
          placeholder="Username"
          helpText="Your username will be displayed next to any Comments you post."
          value={username}
          onChangeText={(text) => this.setState({ username: text })}
          submitted={submitted && !error}
          error={!username ? 'Username is required' : null}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          placeholder="Password"
          helpText="Your password must be at least 7 characters long."
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => this.setState({ password: text })}
          submitted={submitted && !error}
          error={!password ? 'Password is required' :
            password.length < 7 ? 'Your password must be at least 7 characters long.' : null}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          placeholder="Confirm password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(text) => this.setState({ confirmPassword: text })}
          submitted={submitted && !error}
          error={password !== confirmPassword ? 'Passwords do not match' : null}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email (optional)"
          helpText="Provide an email address to enable account recovery features."
          value={email}
          onChangeText={(text) => this.setState({ email: text })}
          submitted={submitted && !error}
        />
        <HQText style={[hqStyles.p1, hqStyles.small]}>
          By clicking Sign up below, you are agreeing to our {}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.honestq.com/docs/TermsOfService')}>
            Terms of Service
          </Text>
          {} and {}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.honestq.com/docs/PrivacyPolicy')}>
            Privacy Policy
          </Text>
          .
        </HQText>
        <View style={hqStyles.rowJustifySpace}>
          <HQNavigationButton title="Already have an account? Log in" onPress={this.navigateToLogIn} />
          <HQSubmitButton title="Sign up" onPress={this.handleSubmit} submitting={submitting} />
        </View>
      </KeyboardPaddedScrollView>
    );
  }

  private navigateToLogIn() {
    NavigationService.navigate('LogIn');
  }

  private handleSubmit(): void {
    const { confirmPassword } = this.state;
    this.props.submit(this.state, confirmPassword!);
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: any) => (state.signUp);
export default connect(mapStateToProps, SignUpStore.actionCreators)(SignUpScreen);

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  } as TextStyle,
});
