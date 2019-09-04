import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { HQSubmitButton } from '../hq-components';
import { ApplicationState } from '../store';
import * as LogOutStore from '../store/LogOut';

type Props = LogOutStore.LogOutState
  & typeof LogOutStore.actionCreators;

class LogOutButton extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);

    this.handleLogOut = this.handleLogOut.bind(this);
  }

  public render() {
    const { submitting } = this.props;

    return (
      <View>
        <HQSubmitButton title="Log out" onPress={this.handleLogOut} submitting={submitting} />
      </View>
    );
  }

  private handleLogOut(): void {
    this.props.submit();
  }
}

const mapStateToProps = (state: ApplicationState) => (state.logOut);
export default connect(mapStateToProps, LogOutStore.actionCreators)(LogOutButton);
