import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { AnswerModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as QuestionStore from '../../store/Question';
import { buildAnswerUrl, buildQuestionUrl } from '../../utils/route-utils';
import TagsList from '../Tags/List';
import Answer from './Answer';
import BackToQuestionButton from './BackToQuestionButton';
import Question from './Question';

type ContainerProps = QuestionStore.ContainerState
    & typeof QuestionStore.actionCreators
    & { questionId: number, questionSlug: string, answerId?: number, answerSlug?: string }
    & RouteComponentProps<{}>;

class Container extends React.Component<ContainerProps> {

    constructor(props: ContainerProps) {
        super(props);

        this.handleReaction = this.handleReaction.bind(this);
        this.handleWatch = this.handleWatch.bind(this);
    }

    public componentWillMount() {
        // This will also run on server side render
        if (this.shouldGetQuestion()) {
            this.props.getQuestion(this.props.questionId);
        }
    }

    public render() {
        const { question, questionSlug, answerId, answerSlug } = this.props;
        const answer = this.getCurrentAnswer();

        if (question && question.questionId && question.model &&
            ((question.model.slug !== questionSlug) || (answer && answer.slug !== answerSlug))) {
            // URL isn't canonical. Let's 301 redirect.
            if (this.props.staticContext) {
                this.props.staticContext.statusCode = 301;
            }
            const canonicalUrl = answer ?
                buildAnswerUrl(question.questionId, question.model.slug, answer.id, answer.slug) :
                buildQuestionUrl(question.questionId, question.model.slug);
            return <Redirect to={canonicalUrl} />;
        }

        const slideDurationMilliseconds = 500;

        return (
            <>
                {this.renderHelmetTags()}

                {question &&
                    <div className="row">
                        <div className="col-lg-3 d-none d-lg-block">
                            {question.model &&
                                <TagsList selectedTagSlugs={question.model.tags.map((x) => x.slug)} />
                            }
                        </div>
                        <div className="col-lg-6">
                            <div className="row">
                                {(question.loading || question.error) &&
                                    <div className="col-md-12">
                                        {question.loading &&
                                            <p>⏳ <i>Loading...</i></p>}
                                        {question.error &&
                                            <div className="alert alert-danger" role="alert">{question.error}</div>}
                                    </div>
                                }
                                {question.model &&
                                    <TransitionGroup component={undefined}>
                                        {!answerId &&
                                            <CSSTransition
                                                timeout={slideDurationMilliseconds}
                                                classNames="slide"
                                            >
                                                <div className="col-md-12 slide slide-left">
                                                    <Question
                                                        {...question}
                                                        onReaction={this.handleReaction}
                                                        onWatch={this.handleWatch}
                                                    />
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
                                                    />
                                                    <Answer
                                                        {...answer}
                                                        questionId={question.questionId!}
                                                        onReaction={this.handleReaction}
                                                        onWatch={this.handleWatch}
                                                    />
                                                </div>
                                            </CSSTransition>
                                        }
                                    </TransitionGroup>
                                }
                            </div>
                        </div>
                    </div>
                }
            </>
        );
    }

    private getCurrentAnswer(): AnswerModel | undefined {
        const { question, answerId } = this.props;
        if (question.model && answerId && answerId > 0) {
            return question.model.answers.filter((x) => x.id === answerId)[0];
        }
    }

    private renderHelmetTags() {
        const { question } = this.props;

        if (!question.model) {
            return (
                <Helmet>
                    <title>⏳ 𝘓𝘰𝘢𝘥𝘪𝘯𝘨...</title>
                </Helmet>
            );
        }

        let pageTitle = `HonestQ: \u201C${question.model.text}\u201D`;
        let canonicalUrl = `https://www.honestq.com/questions/${question.questionId}/${question.model.slug}`;

        let ogTitle = 'HonestQ';
        let ogDescription = `😇 ${pageTitle}`;

        const answer = this.getCurrentAnswer();
        if (answer) {
            pageTitle += ` » 🙋 \u201C${answer.text}\u201D`;
            canonicalUrl += `/${answer.id}/${answer.slug}`;
            ogTitle = ogDescription;
            ogDescription = `🙋 \u201C${answer.text}\u201D`;
        }

        return (
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content="https://www.honestq.com/android-chrome-256x256.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@HonestQ_com" />
            </Helmet>
        );
    }

    private shouldGetQuestion(): boolean {
        const { questionId, question } = this.props;
        if (!questionId) {
            return false;
        }
        if (!question) {
            return true;
        }
        if (question.loading) {
            return false;
        }
        return (question.questionId !== questionId);
    }

    private handleReaction(reactionType: string, on: boolean, answerId: number, commentId?: number): void {
        const { questionId } = this.props;
        if (on) {
            this.props.addReaction(reactionType, questionId, answerId, commentId);
        } else {
            this.props.removeReaction(reactionType, questionId, answerId, commentId);
        }
    }

    private handleWatch(on: boolean, answerId?: number, commentId?: number): void {
        this.props.updateWatch(on, this.props.questionId, answerId, commentId);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.question),
    QuestionStore.actionCreators,
)(Container);
