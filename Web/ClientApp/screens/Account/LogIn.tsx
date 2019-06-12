import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import LogInForm from '../../components/Account/LogInForm';
import { LogInFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as LoginStore from '../../store/Login';
import { parseQueryString } from '../../utils/route-utils';

type LogInProps = LoginStore.LoginState
    & typeof LoginStore.actionCreators
    & RouteComponentProps<{}>;

class LogIn extends React.Component<LogInProps> {

    private readonly isVerified: boolean = false;
    private readonly username: string | undefined;

    constructor(props: LogInProps) {
        super(props);

        const queryStringParams = parseQueryString(this.props.location.search);
        const verified = queryStringParams.get('verified');
        this.isVerified = (verified === '1');
        this.username = queryStringParams.get('username');

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        window.scrollTo(0, 0);
    }

    public render() {
        if (this.props.loggedInUser) {
            return <Redirect to="/" />;
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 offset-lg-3">
                        {this.isVerified &&
                            <div className="alert alert-success mt-3" role="alert">
                                <strong>Account verified!</strong> Log in below to get full access.
                        </div>
                        }
                        <LogInForm
                            username={this.username}
                            onSubmit={this.handleSubmit}
                            submitting={this.props.submitting}
                            submitted={this.props.submitted}
                            error={this.props.error}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private handleSubmit(form: LogInFormModel): void {
        this.props.logIn(form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.login),
    LoginStore.actionCreators,
)(LogIn);
