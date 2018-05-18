import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AuthHelper, IAuthenticatedUser } from '../helpers/auth-helper';
import * as Utils from '../utils';

// tslint:disable-next-line:interface-name
interface UserState {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
}
// tslint:disable-next-line:interface-name
interface State {
    user: UserState;
    registering: boolean;
    submitted: boolean;
}

export default class Register extends React.Component<RouteComponentProps<{}>, State> {

    constructor(props: RouteComponentProps<{}>) {
        super(props);

        this.state = {
            registering: false,
            submitted: false,
            user: {
                firstName: '',
                lastName: '',
                password: '',
                username: '',
            },
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public render() {
        const { user, registering, submitted } = this.state;

        return (
            <div className="col-md-6">
                <h2>Register</h2>
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !user.firstName ? ' has-error' : '')}>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={user.firstName}
                            onChange={this.handleChange}
                        />
                        {submitted && !user.firstName && <div className="help-block">First Name is required</div>}
                    </div>
                    <div className={'form-group' + (submitted && !user.lastName ? ' has-error' : '')}>
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={user.lastName}
                            onChange={this.handleChange}
                        />
                        {submitted && !user.lastName && <div className="help-block">Last Name is required</div>}
                    </div>
                    <div className={'form-group' + (submitted && !user.username ? ' has-error' : '')}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={user.username}
                            onChange={this.handleChange}
                        />
                        {submitted && !user.username && <div className="help-block">Username is required</div>}
                    </div>
                    <div className={'form-group' + (submitted && !user.password ? ' has-error' : '')}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={user.password}
                            onChange={this.handleChange}
                        />
                        {submitted && !user.password && <div className="help-block">Password is required</div>}
                    </div>
                    <div className="form-group">
                        <button className="btn btn-primary">Register</button>
                        {/* tslint:disable-next-line:max-line-length */}
                        {registering && <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />}
                        <Link to="/login" className="btn btn-link">Cancel</Link>
                    </div>
                </form>
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget;
        const { user } = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value,
            },
        });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        this.setState({ submitted: true });
        const { user } = this.state;
        if (user.firstName && user.lastName && user.username && user.password) {
            this.setState({ registering: true });
            const requestOptions: RequestInit = {
                body: JSON.stringify(user),
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            };

            fetch('/api/users/register', requestOptions)
                .then((response) => Utils.handleResponse<IAuthenticatedUser>(response), Utils.handleError)
                .then((authenticatedUser) => {
                    // login successful if there's a jwt token in the response
                    if (authenticatedUser && authenticatedUser.token) {
                        AuthHelper.login(authenticatedUser);
                    }

                    this.setState({ registering: false });
                    location.href = '/';
                })
                .catch((reason) => {
                    this.setState({ registering: false });
                    // TODO: better
                    alert(reason);
                });
        }
    }
}
