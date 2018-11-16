import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as AdminHomeStore from '../../store/AdminHome';
import { isUserInRole } from '../../utils/auth-utils';
import Loading from '../shared/Loading';

type AdminHomeProps = AdminHomeStore.AdminHomeState
    & typeof AdminHomeStore.actionCreators
    & RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel };

class AdminHome extends React.Component<AdminHomeProps, {}> {

    public componentWillMount() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return;
        }
        if (!this.props.unapprovedTagsList.loadedModel) {
            this.props.getUnapprovedTagsList();
        }
        if (!this.props.unapprovedQuestionsList.loadedModel) {
            this.props.getUnapprovedQuestionsList();
        }
    }

    public render() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return <Redirect to="/" />;
        }
        const { unapprovedTagsList, unapprovedQuestionsList } = this.props;
        return (
            <>
                <div className="row">
                    <div className="col-lg-6 offset-lg-3">
                        <h1>Admin</h1>
                        <h2>Tags awaiting Approval:</h2>
                        <Loading {...unapprovedTagsList} />
                        {unapprovedTagsList.loadedModel &&
                            (unapprovedTagsList.loadedModel.tags.length === 0 ?
                                <p>All done!</p>
                                :
                                <ul className="list-inline">
                                    {unapprovedTagsList.loadedModel.tags.map((x, i) =>
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
                        <Loading {...unapprovedQuestionsList} />
                        {unapprovedQuestionsList.loadedModel &&
                            (unapprovedQuestionsList.loadedModel.questions.length === 0 ?
                                <p>All done!</p>
                                :
                                <ul className="list-inline">
                                    {unapprovedQuestionsList.loadedModel.questions.map((x, i) =>
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
    (state: ApplicationState, ownProps: any): any => ({ ...state.adminHome, loggedInUser: state.login.loggedInUser }),
    AdminHomeStore.actionCreators,
)(AdminHome);
