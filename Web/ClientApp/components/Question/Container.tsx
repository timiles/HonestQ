import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { AnswerModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as QuestionStore from '../../store/Question';
import { isUserInRole } from '../../utils/auth-utils';
import { buildAnswerUrl, buildQuestionUrl } from '../../utils/route-utils';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';
import RedirectWithStatusCode from '../shared/RedirectWithStatusCode';
import TagsList from '../Tags/List';
import Answer from './Answer';
import AnswersList from './AnswersList';
import BackToQuestionButton from './BackToQuestionButton';
import Context from './Context';
import QuestionHeader from './QuestionHeader';
import QuestionTagsList from './QuestionTagsList';

interface OwnProps {
    questionId: number;
    questionSlug: string;
    answerId?: number;
    answerSlug?: string;
}

type ContainerProps = QuestionStore.ContainerState
    & typeof QuestionStore.actionCreators
    & OwnProps
    & {
        getQuestionStatus: ActionStatus,
    };

class Container extends React.Component<ContainerProps> {

    constructor(props: ContainerProps) {
        super(props);

        this.handleReaction = this.handleReaction.bind(this);
        this.handleWatch = this.handleWatch.bind(this);

        // This will also run on server side render
        this.props.getQuestion(this.props.questionId);
    }

    public componentWillUnmount() {
        this.props.reset();
    }

    public render() {
        const { question, questionId, questionSlug, answerId, answerSlug } = this.props;
        const answer = this.getCurrentAnswer();

        if (question && ((question.slug !== questionSlug) || (answer && answer.slug !== answerSlug))) {
            // URL isn't canonical. Let's 301 redirect.
            const canonicalUrl = answer ?
                buildAnswerUrl(questionId, question.slug, answer.id, answer.slug) :
                buildQuestionUrl(questionId, question.slug);
            return <RedirectWithStatusCode to={canonicalUrl} statusCode={301} />;
        }

        return (
            <>
                {this.renderHelmetTags()}
                {question &&
                    <div className="cityscape-background">
                        <LoggedInUserContext.Consumer>
                            {(user) => isUserInRole(user, 'Admin') &&
                                <div className="container">
                                    <div className="clearfix">
                                        <Link
                                            className="btn btn-danger float-right"
                                            to={`/admin/edit/questions/${questionId}`}
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            }
                        </LoggedInUserContext.Consumer>
                        <QuestionHeader question={question} onWatch={this.handleWatch} />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8">
                                    <ActionStatusDisplay {...this.props.getQuestionStatus} />
                                    {!answerId &&
                                        <div>
                                            <Context value={question.context} />
                                            <div className="d-lg-none mt-3">
                                                <QuestionTagsList tags={question.tags} />
                                            </div>
                                            <AnswersList
                                                questionId={questionId}
                                                questionSlug={question.slug}
                                                answers={question.answers}
                                            />
                                        </div>
                                    }
                                    {answer &&
                                        <>
                                            <BackToQuestionButton
                                                id={questionId}
                                                slug={question.slug}
                                            />
                                            <Answer
                                                {...answer}
                                                questionId={questionId}
                                                onReaction={this.handleReaction}
                                                onWatch={this.handleWatch}
                                            />
                                        </>
                                    }
                                </div>
                                <div className="col-lg-4 d-none d-lg-block">
                                    <label className="mb-1">Browse by Tags</label>
                                    <TagsList selectedTagSlugs={question ? question.tags.map((x) => x.slug) : []} />
                                </div>
                            </div>
                        </div>
                    </div>
                    ||
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8">
                                <ActionStatusDisplay {...this.props.getQuestionStatus} />
                            </div>
                        </div>
                    </div>
                }
            </>
        );
    }

    private getCurrentAnswer(): AnswerModel | undefined {
        const { question, answerId } = this.props;
        if (question && answerId && answerId > 0) {
            return question.answers.filter((x) => x.id === answerId)[0];
        }
    }

    private renderHelmetTags() {
        const { questionId, question } = this.props;

        if (!question) {
            return (
                <Helmet>
                    <title>⏳ 𝘓𝘰𝘢𝘥𝘪𝘯𝘨...</title>
                </Helmet>
            );
        }

        // Only title displays on mobile Twitter, so we have to have the Question there.
        // If linking to the Question and not an Answer, we repeat the Question in the description.
        interface HelmetValues {
            pageTitle: string;
            canonicalUrl: string;
            ogTitle: string;
            ogDescription: string;
        }
        const answer = this.getCurrentAnswer();
        const root = 'https://www.honestq.com';
        const helmetValues: HelmetValues = (answer) ?
            {
                pageTitle: `HonestQ: ${question.text} » Ⓐ \u201C${answer.text}\u201D`,
                canonicalUrl: `${root}${buildAnswerUrl(questionId, question.slug, answer.id, answer.slug)}`,
                ogTitle: `HonestQ: ${question.text}`,
                ogDescription: `Ⓐ \u201C${answer.text}\u201D`,
            } :
            {
                pageTitle: `HonestQ: ${question.text}`,
                canonicalUrl: `${root}${buildQuestionUrl(questionId, question.slug)}`,
                ogTitle: `HonestQ: ${question.text}`,
                ogDescription: `Ⓠ ${question.text}`,
            };

        return (
            <Helmet>
                <title>{helmetValues.pageTitle}</title>
                <link rel="canonical" href={helmetValues.canonicalUrl} />
                <meta property="og:url" content={helmetValues.canonicalUrl} />
                <meta property="og:title" content={helmetValues.ogTitle} />
                <meta property="og:description" content={helmetValues.ogDescription} />
                <meta property="og:image" content="https://www.honestq.com/android-chrome-256x256.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@HonestQ_com" />
            </Helmet>
        );
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
    (state: ApplicationState, ownProps: OwnProps) => ({
        ...state.question,
        getQuestionStatus: getActionStatus(state, 'GET_QUESTION'),
    }),
    QuestionStore.actionCreators,
)(Container);
