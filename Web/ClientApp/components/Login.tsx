import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { LoginFormModel } from '../server-models/LoginFormModel';
import { ApplicationState } from '../store';
import * as LoginStore from '../store/Login';

type LoginProps = LoginStore.LoginState
    & typeof LoginStore.actionCreators
    & RouteComponentProps<{}>;

class Login extends React.Component<LoginProps, LoginFormModel> {

    constructor(props: LoginProps) {
        super(props);

        this.state = new LoginFormModel();

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
            <div className="col-md-6">
                <h2>Login</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !username ? ' has-error' : '')}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
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
                        <button className="btn btn-primary">Login</button>
                        {/* tslint:disable-next-line:max-line-length */}
                        {submitting && <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />}
                        <Link to="/register" className="btn btn-link">Register</Link>
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
    (state: ApplicationState) => state.login,
    LoginStore.actionCreators,
)(Login) as typeof Login;
