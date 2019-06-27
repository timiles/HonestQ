import React from 'react';
import { Button, NativeSyntheticEvent, NativeTouchEvent } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { HQContentView, HQLabel, HQTextInput } from '../../hq-components';
import { LogInFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as LoginStore from '../../store/Login';

type LogInProps = LoginStore.LoginState
  & typeof LoginStore.actionCreators
  & {
    navigation: NavigationScreenProp<{}, {}>;
  };

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
      this.props.navigation.goBack();
    }
  }

  public render() {
    const { username, password } = this.state;

    return (
      <HQContentView>
        <HQLabel>Log in</HQLabel>
        <HQLabel>Username or email</HQLabel>
        <HQTextInput
          autoCapitalize="none"
          autoFocus={true}
          value={username}
          onChangeText={(text) => this.setState({ username: text })}
        />
        <HQLabel>Password</HQLabel>
        <HQTextInput
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => this.setState({ password: text })}
        />
        <Button title="Log in" onPress={this.handleSubmit} />
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
