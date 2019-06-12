import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../../store';
import * as VerifyEmailStore from '../../store/VerifyEmail';
import { parseQueryString } from '../../utils/route-utils';

type VerifyEmailProps = VerifyEmailStore.VerifyEmailState
    & typeof VerifyEmailStore.actionCreators
    & RouteComponentProps<{}>;

class VerifyEmail extends React.Component<VerifyEmailProps> {

    public componentDidMount() {
        // This will not run on server side render
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
        const { submitting, success, username, error } = this.props;

        if (success) {
            return <Redirect to={`/login?verified=1&username=${username || ''}`} />;
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 offset-lg-3">
                        <h2>Verifying your email</h2>
                        {submitting && <p>⏳ <i>Submitting...</i></p>}
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => (state.verifyEmail),
    VerifyEmailStore.actionCreators,
)(VerifyEmail);
