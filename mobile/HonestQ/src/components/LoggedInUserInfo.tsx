import React from 'react';
import { Button, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LoginStore from '../store/Login';
import LogOutButton from './LogOutButton';

interface OwnProps {
  navigation: any;
}

type Props = LoginStore.LoginState
  & OwnProps;

class LoggedInUserInfo extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);

    this.navigateToLogIn = this.navigateToLogIn.bind(this);
  }

  public render() {
    const { loggedInUser } = this.props;

    if (!loggedInUser) {
      return (
        <View>
          <Text>Not logged in.</Text>
          <Button title="Log in" onPress={this.navigateToLogIn} />
        </View>
      );
    }

    return (
      <View>
        <Text>Hello, {loggedInUser.username}.</Text>
        <LogOutButton />
      </View>
    );
  }

  private navigateToLogIn(): void {
    this.props.navigation.navigate('LogIn');
  }
}

const mapStateToProps = (state: ApplicationState) => (state.login);
export default connect(mapStateToProps)(LoggedInUserInfo);
