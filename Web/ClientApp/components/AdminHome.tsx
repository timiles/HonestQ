import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, TopicListItemModel } from '../server-models';
import { ApplicationState } from '../store';
import * as AdminHomeStore from '../store/AdminHome';
import { isUserInRole } from '../utils';
import Loading from './shared/Loading';

type AdminHomeProps = AdminHomeStore.AdminHomeState
    & typeof AdminHomeStore.actionCreators
    & RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel };

class AdminHome extends React.Component<AdminHomeProps, {}> {

    public componentWillMount() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return;
        }
        if (!this.props.unapprovedTopicsList.loadedModel) {
            this.props.getUnapprovedTopicsList();
        }
    }

    public render() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return <Redirect to="/" />;
        }
        const { loadedModel } = this.props.unapprovedTopicsList;
        return (
            <div className="col-lg-6 offset-lg-3">
                <h1>Admin</h1>
                <h2>Topics awaiting Approval:</h2>
                <Loading {...this.props.unapprovedTopicsList} />
                {loadedModel && (loadedModel.topics.length === 0 ?
                    <p>All done!</p>
                    :
                    <ul className="topics-list">
                        {loadedModel.topics.map((x: TopicListItemModel, i: number) =>
                            <li key={`topic${i}`} className="mr-2 mb-2">
                                <Link to={`/admin/edit/topics/${x.slug}`} className="btn btn-lg btn-outline-secondary">
                                    {x.name}
                                </Link>
                            </li>)
                        }
                    </ul>
                )}
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.adminHome, loggedInUser: state.login.loggedInUser }),
    AdminHomeStore.actionCreators,
)(AdminHome);
