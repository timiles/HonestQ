import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { LoginFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as LoginStore from '../store/Login';
import SubmitButton from './shared/SubmitButton';

type LoginProps = LoginStore.LoginState
    & typeof LoginStore.actionCreators
    & RouteComponentProps<{}>;

class Login extends React.Component<LoginProps, LoginFormModel> {

    constructor(props: LoginProps) {
        super(props);

        this.state = {
            username: '',
            password: '',
            rememberMe: true,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public render() {
        if (this.props.loggedInUser) {
            return <Redirect to="/intro" />;
        }
        const { username, password, rememberMe } = this.state;
        const { submitting, submitted, error } = this.props;
        return (
            <div className="col-lg-6 offset-lg-3">
                <h2>Login</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !username ? ' has-error' : '')}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={username}
                            onChange={this.handleChange}
                        />
                        {submitted && !username && <div className="help-block">Username is required</div>}
                    </div>
                    <div className={'form-group' + (submitted && !password ? ' has-error' : '')}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={password}
                            onChange={this.handleChange}
                        />
                        {submitted && !password && <div className="help-block">Password is required</div>}
                    </div>
                    <div className="form-group">
                        <div className="checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={rememberMe}
                                    onChange={this.handleChange}
                                /> Remember me
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <SubmitButton submitting={submitting} text="Login" />
                        {/* PRIVATE BETA: <Link to="/register" className="btn btn-link">Register</Link> */}
                    </div>
                </form>
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value, checked } = event.currentTarget;
        if (name === 'rememberMe') {
            this.setState({ ...this.state, [name]: checked });
        } else {
            this.setState({ ...this.state, [name]: value });
        }
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.login(this.state);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.login),
    LoginStore.actionCreators,
)(Login);
