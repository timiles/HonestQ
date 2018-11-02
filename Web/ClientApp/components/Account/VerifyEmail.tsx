import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../../store';
import * as VerifyEmailStore from '../../store/VerifyEmail';
import { parseQueryString } from '../../utils';

type VerifyEmailProps = VerifyEmailStore.VerifyEmailState
    & typeof VerifyEmailStore.actionCreators
    & RouteComponentProps<{}>;

class VerifyEmail extends React.Component<VerifyEmailProps> {

    public componentWillMount() {
        // This will also run on server side render
        const queryStringParams = parseQueryString(this.props.location.search);
        const token = queryStringParams.get('token');
        if (token && !this.props.submitting && !this.props.success && !this.props.error) {
            const splitToken = token.split('-');
            this.props.verifyEmail({
                userId: Number(splitToken[0]),
                emailVerificationToken: splitToken[1],
            });
        }
    }

    public render() {
        const { submitting, success, error } = this.props;

        if (success) {
            return <Redirect to="/login" />;
        }

        // Due to SSR, probably won't ever see the Submitting view, but just in case.
        return (
            <div className="row">
                <div className="col-lg-6 offset-lg-3">
                    <h2>Verifying your email</h2>
                    {submitting && <p>⏳ <i>Submitting...</i></p>}
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                </div>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.verifyEmail),
    VerifyEmailStore.actionCreators,
)(VerifyEmail);
