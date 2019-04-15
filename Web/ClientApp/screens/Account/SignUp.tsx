import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import SignUpForm from '../../components/Account/SignUpForm';
import { LoggedInUserModel, SignUpFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as SignUpStore from '../../store/SignUp';

type SignUpProps = SignUpStore.SignUpState
    & typeof SignUpStore.actionCreators
    & RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel; };

class SignUp extends React.Component<SignUpProps> {

    constructor(props: SignUpProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        window.scrollTo(0, 0);
    }

    public render() {
        if (this.props.loggedInUser) {
            return <Redirect to="/" />;
        }

        const { error, submitting, submitted, success } = this.props;

        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 offset-lg-3">
                        <SignUpForm
                            onSubmit={this.handleSubmit}
                            error={error}
                            submitting={submitting}
                            submitted={submitted}
                            success={success}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private handleSubmit(form: SignUpFormModel): void {
        this.props.submitSignUpForm(form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({ ...state.signUp, loggedInUser: state.login.loggedInUser }),
    SignUpStore.actionCreators,
)(SignUp);
