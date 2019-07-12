import React from 'react';
import { Button, View } from 'react-native';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LoginStore from '../store/LogInn';

type Props = typeof LoginStore.actionCreators;

class LoggedInUserInfo extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);

    this.handleLogOut = this.handleLogOut.bind(this);
  }

  public render() {

    return (
      <View>
        <Button title="Log out" onPress={this.handleLogOut} />
      </View>
    );
  }

  private handleLogOut(): void {
    this.props.logOut();
  }
}

const mapStateToProps = (state: ApplicationState) => (state.login);
export default connect(mapStateToProps, LoginStore.actionCreators)(LoggedInUserInfo);
