import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as LoginStore from '../store/Login';

type LogoutProps = LoginStore.LoginState
    & typeof LoginStore.actionCreators
    & RouteComponentProps<{}>;

class Logout extends React.Component<LogoutProps> {

    public componentDidMount() {
        this.props.logout();
    }

    public render() {
        if (this.props.loggedInUser) {
            return (
                <div>Logging out....</div>
            );
        } else {
            return <Redirect to="/" />;
        }
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.login),
    LoginStore.actionCreators,
)(Logout);
