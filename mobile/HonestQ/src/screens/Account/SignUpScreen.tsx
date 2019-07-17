import React from 'react';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../../components/KeyboardPaddedScrollView';
import { HQHeader, HQNavigationButton, HQSubmitButton, HQText, HQTextInput } from '../../hq-components';
import hqStyles from '../../hq-styles';
import NavigationService from '../../NavigationService';
import { SignUpFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as SignUpStore from '../../store/SignUp';

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

  public render() {
    const { submitting = false, submitted, error } = this.props;
    const { username, password, confirmPassword, email } = this.state;

    return (
      <KeyboardPaddedScrollView style={hqStyles.contentView} contentContainerStyle={[hqStyles.p1, hqStyles.center]}>
        <HQHeader style={hqStyles.mb1}>Sign up to HonestQ</HQHeader>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        <HQTextInput
          containerStyle={hqStyles.mb1}
          autoCapitalize="none"
          autoFocus={true}
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
          placeholder="Email (optional)"
          helpText="Provide an email address to enable account recovery features."
          value={email}
          onChangeText={(text) => this.setState({ email: text })}
          submitted={submitted && !error}
        />
        <HQSubmitButton title="Sign up" onPress={this.handleSubmit} submitting={submitting} />
        <HQNavigationButton title="Already have an account? Log in" onPress={this.navigateToLogIn} />
      </KeyboardPaddedScrollView>
    );
  }

  private navigateToLogIn() {
    NavigationService.navigate('LogIn');
  }

  private handleSubmit(): void {
    const { confirmPassword } = this.state;
    this.props.submitSignUpForm(this.state, confirmPassword!);
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: any) => (state.signUp);
export default connect(mapStateToProps, SignUpStore.actionCreators)(SignUpScreen);
