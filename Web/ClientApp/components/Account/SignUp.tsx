import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { SignUpFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as SignUpStore from '../../store/SignUp';
import SubmitButton from '../shared/SubmitButton';

type SignUpProps = SignUpStore.SignUpState
    & typeof SignUpStore.actionCreators
    & RouteComponentProps<{}>;

class SignUp extends React.Component<SignUpProps, SignUpFormModel> {

    constructor(props: SignUpProps) {
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
        const { error, submitting, submitted, success } = this.props;

        return (
            <div className="row">
                <div className="col-lg-6 offset-lg-3">
                    <h2>Sign up</h2>
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
                                By clicking <b>Sign up</b> below, you are agreeing to our {}
                                <a href="/docs/TermsOfService" target="_blank">Terms of Service</a> {}
                                and {}
                                <a href="/docs/PrivacyPolicy" target="_blank">Privacy Policy</a>.
                            </small>
                        </div>
                        {!success && <div className="form-group">
                            <SubmitButton submitting={submitting} text="Sign up" />
                            <Link to="/login" className="btn btn-link">Cancel</Link>
                        </div>}
                    </form>
                    {success &&
                        <div className="alert alert-success mt-3" role="alert">
                            <strong>Sign up successful!</strong> Redirecting you to log in...
                        </div>
                    }
                    {/* TODO: Re-enable Email Verification
                    {success &&
                        <div className="alert alert-success mt-3" role="alert">
                            <strong>Sign up successful!</strong> We are sending a verification email to <b>{email}</b>.
                            Please open the link in the email to finish your sign up.
                        </div>
                    } */}
                </div>
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
    (state: ApplicationState, ownProps: any) => (state.signUp),
    SignUpStore.actionCreators,
)(SignUp);
