import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, TagListItemModel } from '../../server-models';
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
    }

    public render() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return <Redirect to="/" />;
        }
        const { loadedModel } = this.props.unapprovedTagsList;
        return (
            <div className="row">
                <div className="col-lg-6 offset-lg-3">
                    <h1>Admin</h1>
                    <h2>Tags awaiting Approval:</h2>
                    <Loading {...this.props.unapprovedTagsList} />
                    {loadedModel && (loadedModel.tags.length === 0 ?
                        <p>All done!</p>
                        :
                        <ul className="list-inline">
                            {loadedModel.tags.map((x: TagListItemModel, i: number) =>
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
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({ ...state.adminHome, loggedInUser: state.login.loggedInUser }),
    AdminHomeStore.actionCreators,
)(AdminHome);
