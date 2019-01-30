import * as React from 'react';
import { Link } from 'react-router-dom';
import { LogInFormModel } from '../../server-models';
import SubmitButton from '../shared/SubmitButton';

interface Props {
    username?: string;
    onSubmit: (form: LogInFormModel) => void;
    submitting?: boolean;
    submitted?: boolean;
    error?: string | null;
}

export default class LogInForm extends React.Component<Props, LogInFormModel> {

    private readonly usernameInputRef: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            username: this.props.username || '',
            password: '',
            rememberMe: true,
        };

        this.usernameInputRef = React.createRef<HTMLInputElement>();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        this.usernameInputRef.current!.focus();
    }

    public render() {
        const { username, password, rememberMe } = this.state;
        const { submitting, submitted, error } = this.props;
        return (
            <>
                <h2>Log in</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" noValidate={true} onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username or email</label>
                        <input
                            type="text"
                            className={`form-control ${submitted ? username ? 'is-valid' : 'is-invalid' : ''}`}
                            id="username"
                            ref={this.usernameInputRef}
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
                        <SubmitButton submitting={submitting} text="Log in" />
                        <Link to="/signup" className="btn btn-link">Sign up</Link>
                    </div>
                </form>
            </>
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
        this.props.onSubmit(this.state);
    }
}
