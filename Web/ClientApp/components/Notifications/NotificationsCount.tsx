import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as NotificationsCountStore from '../../store/NotificationsCount';

type Props = NotificationsCountStore.NotificationsCountState
    & typeof NotificationsCountStore.actionCreators;

class NotificationsCount extends React.Component<Props, {}> {

    public componentDidMount() {
        if (!this.props.notificationsCount.loading && !this.props.notificationsCount.loadedModel) {
            this.props.getNotificationsCount();
        }
    }

    public render() {
        const { notificationsCount } = this.props;
        if (!notificationsCount.loadedModel || notificationsCount.loadedModel.count === 0) {
            return null;
        }
        return (
            <span className="badge badge-danger">
                {notificationsCount.loadedModel.count}
            </span>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => (state.notificationsCount),
    NotificationsCountStore.actionCreators,
)(NotificationsCount);
