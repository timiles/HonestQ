import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../../store';
import * as LoginStore from '../../store/Login';

type LogOutProps = LoginStore.LoginState
    & typeof LoginStore.actionCreators
    & RouteComponentProps<{}>;

class LogOut extends React.Component<LogOutProps> {

    public componentDidMount() {
        this.props.logOut();
    }

    public render() {
        if (this.props.loggedInUser) {
            return (
                <div className="container">
                    <div className="row">
                        <div>Logging out....</div>
                    </div>
                </div>
            );
        } else {
            return <Redirect to="/" />;
        }
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.login),
    LoginStore.actionCreators,
)(LogOut);
