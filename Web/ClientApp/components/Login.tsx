import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AuthHelper, IAuthenticatedUser } from '../helpers/auth-helper';
import * as Utils from '../utils';

// tslint:disable-next-line:interface-name
interface State {
    username: string;
    password: string;
    loggingIn: boolean;
    submitted: boolean;
}

export default class Login extends React.Component<RouteComponentProps<{}>, State> {

    constructor(props: RouteComponentProps<{}>) {
        super(props);

        this.state = {
            loggingIn: false,
            password: '',
            submitted: false,
            username: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public render() {
        const { username, password, loggingIn, submitted } = this.state;
        return (
            <div className="col-md-6">
                <h2>Login</h2>
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
                        <button className="btn btn-primary">Login</button>
                        {/* tslint:disable-next-line:max-line-length */}
                        {loggingIn && <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />}
                        <Link to="/register" className="btn btn-link">Register</Link>
                    </div>
                </form>
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget;
        if (name === 'username') {
            this.setState({ username: value });
        } else if (name === 'password') {
            this.setState({ password: value });
        }
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        this.setState({ submitted: true });
        const { username, password } = this.state;
        if (username && password) {
            this.setState({ loggingIn: true });
            const requestOptions: RequestInit = {
                body: JSON.stringify({ username, password }),
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            };

            fetch('/api/users/authenticate', requestOptions)
                .then((response) => Utils.handleResponse<IAuthenticatedUser>(response), Utils.handleError)
                .then((authenticatedUser) => {
                    // login successful if there's a jwt token in the response
                    if (authenticatedUser && authenticatedUser.token) {
                        AuthHelper.login(authenticatedUser);
                    }

                    this.setState({ loggingIn: false });
                    location.href = '/';
                })
                .catch((reason) => {
                    this.setState({ loggingIn: false });
                    // TODO: better
                    alert(reason);
                });
        }
    }
}
