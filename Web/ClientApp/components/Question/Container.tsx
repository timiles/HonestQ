import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { AnswerModel, LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as QuestionStore from '../../store/Question';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Answer from './Answer';
import BackToQuestionButton from './BackToQuestionButton';
import Question from './Question';

type ContainerProps = QuestionStore.ContainerState
    & typeof QuestionStore.actionCreators
    & { loggedInUser: LoggedInUserModel | undefined }
    // Important: questionId cannot be number as would still be a string in the underlying JavaScript?
    & RouteComponentProps<{ questionId: string, answerId?: string }>;

class Container extends React.Component<ContainerProps, {}> {

    public componentWillMount() {
        // This will also run on server side render
        if (this.shouldGetQuestion()) {
            this.props.getQuestion(Number(this.props.match.params.questionId));
        }
    }

    public render() {
        const { question } = this.props;
        const answer = this.getCurrentAnswer();

        const slideDurationMilliseconds = 500;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {this.renderHelmetTags()}

                {question &&
                    <>
                        <div className="col-lg-6 offset-lg-3">
                            <div className="row">
                                {(question.loading || question.error) &&
                                    <div className="col-md-12">
                                        {question.loading &&
                                            <p>Loading...</p>}
                                        {question.error &&
                                            <div className="alert alert-danger" role="alert">{question.error}</div>}
                                    </div>
                                }
                                {question.model &&
                                    <TransitionGroup component={undefined}>
                                        {!this.props.match.params.answerId &&
                                            <CSSTransition
                                                timeout={slideDurationMilliseconds}
                                                classNames="slide"
                                            >
                                                <div className="col-md-12 slide slide-left">
                                                    <Question {...question} />
                                                </div>
                                            </CSSTransition>
                                        }
                                        {answer &&
                                            <CSSTransition
                                                timeout={slideDurationMilliseconds}
                                                classNames="slide"
                                            >
                                                <div className="col-md-12 slide slide-right">
                                                    <BackToQuestionButton
                                                        id={question.questionId!}
                                                        slug={question.model.slug}
                                                        text={question.model.text}
                                                    />
                                                    <Answer {...answer} questionId={question.questionId!} />
                                                </div>
                                            </CSSTransition>
                                        }
                                    </TransitionGroup>
                                }
                            </div>
                        </div>
                    </>
                }
            </LoggedInUserContext.Provider>
        );
    }

    private getCurrentAnswer(): AnswerModel | undefined {
        const answerId = Number(this.props.match.params.answerId);
        if (this.props.question.model && answerId > 0) {
            return this.props.question.model.answers.filter((x) => x.id === answerId)[0];
        }
    }

    private renderHelmetTags() {
        const { question } = this.props;

        if (!question.model) {
            return (
                <Helmet>
                    <title>⌛ 𝘓𝘰𝘢𝘥𝘪𝘯𝘨...</title>
                </Helmet>
            );
        }

        let pageTitle = `❓ ${question.model.text}`;
        let canonicalUrl = `https://honestq.com/questions/${question.questionId}/${question.model.slug}`;

        const answer = this.getCurrentAnswer();
        if (answer) {
            pageTitle += ` » 🙋 \u201C ${answer.text} \u201D`;
            canonicalUrl += `/${answer.id}/${answer.slug}`;
        }

        return (
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="canonical" href={canonicalUrl} />
            </Helmet>
        );
    }

    private shouldGetQuestion(): boolean {
        if (!this.props.match.params.questionId) {
            return false;
        }
        const questionIdAsNumber = Number(this.props.match.params.questionId);
        if (isNaN(questionIdAsNumber)) {
            return false;
        }
        if (!this.props.question) {
            return true;
        }
        if (this.props.question.loading) {
            return false;
        }
        return (this.props.question.questionId !== questionIdAsNumber);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.question, loggedInUser: state.login.loggedInUser }),
    QuestionStore.actionCreators,
)(Container);
