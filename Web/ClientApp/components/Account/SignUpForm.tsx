import React from 'react';
import { Link } from 'react-router-dom';
import { SignUpFormModel } from '../../server-models';
import { getValidationClassName } from '../../utils/html-utils';
import SubmitButton from '../shared/SubmitButton';

interface Props {
    onSubmit: (form: SignUpFormModel) => void;
    submitting: boolean;
    submitted: boolean;
    success: boolean;
    error?: string;
}

export default class SignUpForm extends React.Component<Props, SignUpFormModel> {

    private readonly emailInputRef: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            username: '',
        };

        this.emailInputRef = React.createRef<HTMLInputElement>();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        this.emailInputRef.current!.focus();
    }

    public render() {
        const { email, username, password } = this.state;
        const { error, submitting, submitted, success } = this.props;

        return (
            <>
                <h2>Sign up</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            className={`form-control ${getValidationClassName(submitted, email)}`}
                            id="email"
                            ref={this.emailInputRef}
                            name="email"
                            value={email}
                            onChange={this.handleChange}
                            aria-describedby="emailHelpBlock"
                        />
                        <small id="emailHelpBlock" className="form-text text-muted">
                            We will require you to verify your email address before you can log in.
                            </small>
                        <div className="invalid-feedback">Email is required</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className={`form-control ${getValidationClassName(submitted, username)}`}
                            id="username"
                            name="username"
                            autoCorrect="off"
                            autoCapitalize="none"
                            value={username}
                            onChange={this.handleChange}
                            aria-describedby="usernameHelpBlock"
                        />
                        <small id="usernameHelpBlock" className="form-text text-muted">
                            Your username will be displayed next to any Questions, Answers or Comments you post.
                            </small>
                        <div className="invalid-feedback">Username is required</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            autoCorrect="off"
                            autoCapitalize="none"
                            className={`form-control
                                ${getValidationClassName(submitted, password && password.length >= 7)}`}
                            id="password"
                            name="password"
                            value={password}
                            onChange={this.handleChange}
                            aria-describedby="passwordHelpBlock"
                        />
                        <small id="passwordHelpBlock" className="form-text text-muted">
                            Your password must be at least 7 characters long.
                            </small>
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
                        <Link to="/login" className="btn btn-link">Or log in</Link>
                    </div>}
                </form>
                {success &&
                    <div className="alert alert-success mt-3" role="alert">
                        <strong>Sign up successful!</strong> We are sending a verification email to <b>{email}</b>.
                        Please open the link in the email to finish your sign up.
                        </div>
                }
            </>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget;
        this.setState((prevState) => ({ ...prevState, [name]: value }));
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.onSubmit(this.state);
    }
}
