import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { HQSubmitButton } from '../hq-components';
import { ApplicationState } from '../store';
import * as LogOutStore from '../store/LogOut';

const mapStateToProps = (state: ApplicationState) => (state.logOut);
const mapDispatchToProps = LogOutStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

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

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(LogOutButton);
