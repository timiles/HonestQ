import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { RegisterFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as RegisterStore from '../../store/Register';
import SubmitButton from '../shared/SubmitButton';

type RegisterProps = RegisterStore.RegisterState
    & typeof RegisterStore.actionCreators
    & RouteComponentProps<{}>;

class Register extends React.Component<RegisterProps, RegisterFormModel> {

    constructor(props: RegisterProps) {
        super(props);

        this.state = {
            name: '',
            email: '',
            password: '',
            username: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public render() {
        const { name, email, username, password } = this.state;
        const { error, submitting, submitted } = this.props;

        return (
            <div className="col-lg-6 offset-lg-3">
                <h2>Register</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            className={`form-control ${submitted ? name ? 'is-valid' : 'is-invalid' : ''}`}
                            id="name"
                            name="name"
                            value={name}
                            onChange={this.handleChange}
                        />
                        <div className="invalid-feedback">Name is required</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            className={`form-control ${submitted ? email ? 'is-valid' : 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={email}
                            onChange={this.handleChange}
                        />
                        <div className="invalid-feedback">Email is required</div>
                    </div>
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
                            autoCorrect="off"
                            autoCapitalize="none"
                            className={`form-control
                                ${submitted ? password && password.length >= 7 ? 'is-valid' : 'is-invalid' : ''}`}
                            id="password"
                            name="password"
                            value={password}
                            onChange={this.handleChange}
                        />
                        <div className="invalid-feedback">Password must be at least 7 characters</div>

                    </div>
                    <div className="form-group">
                        <small>
                            By clicking <b>Register</b> below, you are agreeing to our&#32;
                            <a href="/docs/TermsOfService" target="_blank">Terms of Service</a>&#32;
                            and&#32;
                            <a href="/docs/PrivacyPolicy" target="_blank">Privacy Policy</a>.
                        </small>
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
        this.setState((prevState) => ({ ...prevState, [name]: value }));
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