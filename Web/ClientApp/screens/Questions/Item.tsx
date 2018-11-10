import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoggedInUserContext } from '../../components/LoggedInUserContext';
import Container from '../../components/Question/Container';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';

type Props = { loggedInUser: LoggedInUserModel | undefined }
    & RouteComponentProps<{ questionId: string, questionSlug: string, answerId?: string, answerSlug?: string }>;

class Item extends React.Component<Props> {

    public render() {
        const { questionId, questionSlug, answerId, answerSlug } = this.props.match.params;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                <Container
                    questionId={Number(questionId)}
                    questionSlug={questionSlug}
                    answerId={Number(answerId)}
                    answerSlug={answerSlug}
                />
            </LoggedInUserContext.Provider>
        );
    }
}

export default connect((state: ApplicationState, ownProps: any): any => (state.login))(Item);
