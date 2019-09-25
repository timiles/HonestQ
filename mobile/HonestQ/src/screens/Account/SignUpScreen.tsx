import React from 'react';
import { CheckBox, StyleSheet, Text, TextStyle, View } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../../components/KeyboardPaddedScrollView';
import { HQSubmitButton, HQText, HQTextInput } from '../../hq-components';
import hqStyles from '../../hq-styles';
import NavigationService from '../../NavigationService';
import { SignUpFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as SignUpStore from '../../store/SignUp';
import ThemeService from '../../ThemeService';

const mapStateToProps = (state: ApplicationState) => (state.signUp);
const mapDispatchToProps = SignUpStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

class SignUpScreen extends React.Component<Props, SignUpFormModel & { confirmPassword?: string, agree: boolean }> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Sign up to HonestQ',
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      agree: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentWillUnmount() {
    this.props.reset();
  }

  public render() {
    const { submitting = false, submitted, error } = this.props;
    const { username, password, confirmPassword, email, agree } = this.state;

    return (
      <KeyboardPaddedScrollView
        style={ThemeService.getStyles().contentView}
        contentContainerStyle={hqStyles.p1}
      >
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
        <View style={[hqStyles.row, hqStyles.p1]}>
          <CheckBox
            style={hqStyles.mr1}
            value={agree}
            onValueChange={(value) => this.setState({ agree: value })}
          />
          <HQText style={[hqStyles.fillSpace, submitted && !agree && hqStyles.error]}>
            I have read and accept the {}
            <Text style={styles.link} onPress={this.navigateToTermsOfService}>Terms of Service</Text>
            {} and {}
            <Text style={styles.link} onPress={this.navigateToPrivacyPolicy}>Privacy Policy</Text>.
          </HQText>
        </View>
        <View style={[hqStyles.row, hqStyles.center]}>
          <HQSubmitButton title="Sign up" onPress={this.handleSubmit} submitting={submitting} />
        </View>
      </KeyboardPaddedScrollView>
    );
  }

  private navigateToTermsOfService() {
    NavigationService.navigate('TermsOfService');
  }

  private navigateToPrivacyPolicy() {
    NavigationService.navigate('PrivacyPolicy');
  }

  private handleSubmit(): void {
    const { confirmPassword, agree } = this.state;
    this.props.submit(this.state, confirmPassword!, agree);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SignUpScreen);

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  } as TextStyle,
});
