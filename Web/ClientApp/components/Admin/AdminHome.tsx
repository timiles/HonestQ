import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as AdminHomeStore from '../../store/AdminHome';
import { isUserInRole } from '../../utils/auth-utils';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';

type AdminHomeProps = AdminHomeStore.AdminHomeState
    & typeof AdminHomeStore.actionCreators
    & RouteComponentProps<{}>
    & {
    loggedInUser: LoggedInUserModel,
    getUnapprovedTagsListStatus: ActionStatus,
    getUnapprovedQuestionsListStatus: ActionStatus,
};

class AdminHome extends React.Component<AdminHomeProps, {}> {

    public componentWillMount() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return;
        }
        if (!this.props.unapprovedTagsList) {
            this.props.getUnapprovedTagsList();
        }
        if (!this.props.unapprovedQuestionsList) {
            this.props.getUnapprovedQuestionsList();
        }
    }

    public render() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return <Redirect to="/" />;
        }
        const { unapprovedTagsList, getUnapprovedTagsListStatus } = this.props;
        const { unapprovedQuestionsList, getUnapprovedQuestionsListStatus } = this.props;
        return (
            <>
                <div className="row">
                    <div className="col-lg-6 offset-lg-3">
                        <h1>Admin</h1>
                        <h2>Tags awaiting Approval:</h2>
                        <ActionStatusDisplay {...getUnapprovedTagsListStatus} />
                        {unapprovedTagsList &&
                            (unapprovedTagsList.tags.length === 0 ?
                                <p>All done!</p>
                                :
                                <ul className="list-inline">
                                    {unapprovedTagsList.tags.map((x, i) =>
                                        <li key={i} className="mr-2 mb-2 list-inline-item">
                                            <Link
                                                to={`/admin/edit/tags/${x.slug}`}
                                                className="btn btn-lg btn-outline-secondary"
                                            >
                                                {x.name}
                                            </Link>
                                        </li>)
                                    }
                                </ul>
                            )}
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-6 offset-lg-3">
                        <h2>Questions awaiting Approval:</h2>
                        <ActionStatusDisplay {...getUnapprovedQuestionsListStatus} />
                        {unapprovedQuestionsList &&
                            (unapprovedQuestionsList.questions.length === 0 ?
                                <p>All done!</p>
                                :
                                <ul className="list-inline">
                                    {unapprovedQuestionsList.questions.map((x, i) =>
                                        <li key={i} className="mr-2 mb-2 list-inline-item">
                                            <Link
                                                to={`/admin/edit/questions/${x.id}`}
                                                className="btn btn-lg btn-outline-secondary"
                                            >
                                                {x.text}
                                            </Link>
                                        </li>)
                                    }
                                </ul>
                            )}
                    </div>
                </div>
            </>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({
        ...state.adminHome,
        loggedInUser: state.login.loggedInUser,
        getUnapprovedTagsListStatus: getActionStatus(state, 'GET_UNAPPROVED_TAGS_LIST'),
        getUnapprovedQuestionsListStatus: getActionStatus(state, 'GET_UNAPPROVED_QUESTIONS_LIST'),
    }),
    AdminHomeStore.actionCreators,
)(AdminHome);
