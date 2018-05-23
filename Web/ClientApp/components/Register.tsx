import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { RegisterFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as RegisterStore from '../store/Register';
import SubmitButton from './shared/SubmitButton';

type RegisterProps = RegisterStore.RegisterState
    & typeof RegisterStore.actionCreators
    & RouteComponentProps<{}>;

class Register extends React.Component<RegisterProps, RegisterFormModel> {

    constructor(props: RegisterProps) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            password: '',
            username: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public render() {
        const { firstName, lastName, username, password } = this.state;
        const { error, submitting, submitted } = this.props;

        return (
            <div className="col-md-6">
                <h2>Register</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !firstName ? ' has-error' : '')}>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={firstName}
                            onChange={this.handleChange}
                        />
                        {submitted && !firstName && <div className="help-block">First Name is required</div>}
                    </div>
                    <div className={'form-group' + (submitted && !lastName ? ' has-error' : '')}>
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={lastName}
                            onChange={this.handleChange}
                        />
                        {submitted && !lastName && <div className="help-block">Last Name is required</div>}
                    </div>
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
                        <SubmitButton submitting={submitting} text="Register" />
                        <Link to="/login" className="btn btn-link">Cancel</Link>
                    </div>
                </form>
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget;
        this.setState({ ...this.state, [name]: value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submitRegistrationForm(this.state);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.register),
    RegisterStore.actionCreators,
)(Register);
