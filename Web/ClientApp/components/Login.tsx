import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
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
            return <Redirect to="/" />;
        }
        const { username, password, rememberMe } = this.state;
        const { submitting, submitted, error } = this.props;
        return (
            <div className="col-lg-6 offset-lg-3">
                <h2>Login</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" noValidate={true} onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className={`form-control ${submitted ? username ? 'is-valid' : 'is-invalid' : ''}`}
                            id="username"
                            name="username"
                            autoCorrect="off"
                            autoCapitalize="none"
                            value={username}
                            onChange={this.handleChange}
                        />
                        <div className="invalid-feedback">Username is required</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className={`form-control ${submitted ? password ? 'is-valid' : 'is-invalid' : ''}`}
                            id="password"
                            name="password"
                            value={password}
                            onChange={this.handleChange}
                        />
                        <div className="invalid-feedback">Password is required</div>
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
                        <Link to="/register" className="btn btn-link">Register</Link>
                    </div>
                </form>
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value, checked } = event.currentTarget;
        if (name === 'rememberMe') {
            this.setState((prevState) => ({ ...prevState, [name]: checked }));
        } else {
            this.setState((prevState) => ({ ...prevState, [name]: value }));
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
