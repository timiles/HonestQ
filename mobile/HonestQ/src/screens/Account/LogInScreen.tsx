import React from 'react';
import { NativeSyntheticEvent, NativeTouchEvent, Text } from 'react-native';
import { connect } from 'react-redux';
import { HQContentView, HQHeader, HQSubmitButton, HQTextInput } from '../../hq-components';
import hqStyles from '../../hq-styles';
import NavigationService from '../../NavigationService';
import { LogInFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as LoginStore from '../../store/Login';

type LogInProps = LoginStore.LoginState
  & typeof LoginStore.actionCreators;

class LogInScreen extends React.Component<LogInProps, LogInFormModel> {

  constructor(props: LogInProps) {
    super(props);

    this.state = {
      username: '',
      password: '',
      rememberMe: true,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidUpdate() {
    if (this.props.loggedInUser) {
      NavigationService.goBack();
    }
  }

  public render() {
    const { submitting = false, submitted, error } = this.props;
    const { username, password } = this.state;

    return (
      <HQContentView style={hqStyles.p1}>
        <HQHeader style={hqStyles.mb1}>Log in</HQHeader>
        {error && <Text style={hqStyles.error}>{error}</Text>}
        <HQTextInput
          containerStyle={hqStyles.mb1}
          autoCapitalize="none"
          autoFocus={true}
          placeholder="Username or email"
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
          error={!password ? 'Password is required' : null}
        />
        <HQSubmitButton title="Log in" onPress={this.handleSubmit} submitting={submitting} />
      </HQContentView>
    );
  }

  private handleSubmit(ev: NativeSyntheticEvent<NativeTouchEvent>): void {
    this.props.logIn(this.state);
  }
}

export default connect(
  (state: ApplicationState, ownProps: any) => (state.login),
  LoginStore.actionCreators,
)(LogInScreen);
