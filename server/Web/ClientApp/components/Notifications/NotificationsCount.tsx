import React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as NotificationsCountStore from '../../store/NotificationsCount';

type Props = NotificationsCountStore.NotificationsCountState
  & typeof NotificationsCountStore.actionCreators
  & {
    getNotificationsCountStatus: ActionStatus,
  };

class NotificationsCount extends React.Component<Props, {}> {

  public componentDidMount() {
    if (!this.props.getNotificationsCountStatus ||
      (!this.props.getNotificationsCountStatus.loading && !this.props.notificationsCount)) {
      this.props.getNotificationsCount();
    }
  }

  public render() {
    const { notificationsCount } = this.props;
    if (!notificationsCount || notificationsCount.count === 0) {
      return null;
    }
    return (
      <span className="badge badge-danger">
        {notificationsCount.count}
      </span>
    );
  }
}

export default connect(
  (state: ApplicationState, ownProps: any): any => ({
    ...state.notificationsCount,
    getNotificationsCountStatus: getActionStatus(state, 'GET_NOTIFICATIONS_COUNT'),
  }),
  NotificationsCountStore.actionCreators,
)(NotificationsCount);
