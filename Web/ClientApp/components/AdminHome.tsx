import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, TopicListItemModel } from '../server-models';
import { ApplicationState } from '../store';
import * as AdminHomeStore from '../store/AdminHome';
import { isUserInRole } from '../utils';

type AdminHomeProps = AdminHomeStore.AdminHomeState
    & typeof AdminHomeStore.actionCreators
    & RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel };

class AdminHome extends React.Component<AdminHomeProps, {}> {

    public componentWillMount() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return;
        }
        if (!this.props.unapprovedTopicsList) {
            this.props.getUnapprovedTopicsList();
        }
    }

    public render() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return <Redirect to="/" />;
        }
        const { unapprovedTopicsList } = this.props;
        return (
            <div className="col-md-6 offset-md-3">
                <h1>Admin</h1>
                <h2>Topics awaiting Approval:</h2>
                <ul className="topics-list list-unstyled">
                    {unapprovedTopicsList &&
                        unapprovedTopicsList.topics.map((x: TopicListItemModel, i: number) =>
                            <li key={`topic${i}`}>
                                {x.name}
                            </li>)
                    }
                </ul>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.adminHome, loggedInUser: state.login.loggedInUser }),
    AdminHomeStore.actionCreators,
)(AdminHome);
