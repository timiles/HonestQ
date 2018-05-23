import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { LoginResponseModel } from '../server-models';
import { ApplicationState } from '../store';
import { isUserInRole } from '../utils';
import NewTopic from './NewTopic';

interface AdminProps {
    loggedInUser: LoginResponseModel;
}

class Admin extends React.Component<AdminProps & RouteComponentProps<{}>, {}> {

    public render() {
        if (!isUserInRole(this.props.loggedInUser, 'Admin')) {
            return <Redirect to="/" />;
        }
        return (
            <div>
                <h1>Admin</h1>
                <NewTopic />
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ loggedInUser: state.login.loggedInUser }),
    {},
)(Admin);
