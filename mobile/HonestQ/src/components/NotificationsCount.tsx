import React from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';
import hqColors from '../hq-colors';
import { HQLabel } from '../hq-components';
import hqStyles from '../hq-styles';
import { ApplicationState } from '../store';
import * as NotificationsCountStore from '../store/NotificationsCount';
import NotificationIcon from '../svg-icons/NotificationIcon';

const mapStateToProps = (state: ApplicationState) => (state.notificationsCount);
const mapDispatchToProps = NotificationsCountStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

class NotificationsCount extends React.Component<Props> {

  public componentDidMount() {
    if (!this.props.notificationsCount) {
      this.props.getNotificationsCount();
    }
  }

  public render() {
    const { notificationsCount } = this.props;
    if (!notificationsCount || notificationsCount.count === 0) {
      return null;
    }

    return (
      <View style={hqStyles.row}>
        <NotificationIcon />
        <View style={styles.countLabel}>
          <HQLabel style={styles.countLabelText}>
            {notificationsCount.count}
          </HQLabel>
        </View>
      </View>
    );
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(NotificationsCount);

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  countLabel: {
    backgroundColor: hqColors.Orange,
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingTop: 2,
    borderRadius: 5,
  } as ViewStyle,

  countLabelText: {
    color: '#fff',
    fontSize: 12,
  } as TextStyle,
});
