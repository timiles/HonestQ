import { EventEmitter } from 'events';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { QuestionListItemModel, TagValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as QuestionsStore from '../../store/Questions';
import { buildQuestionUrl } from '../../utils/route-utils';
import NewQuestion from '../QuestionForm/NewQuestion';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';
import Emoji, { EmojiValue } from '../shared/Emoji';

type Props = QuestionsStore.ListState
    & typeof QuestionsStore.actionCreators
    & {
    windowScrollEventEmitter: EventEmitter,
    onAllQuestionsLoaded: () => void,
    getQuestionsListStatus: ActionStatus,
};

class QuestionList extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.props.windowScrollEventEmitter.addListener('scrolledToBottom', () => {
            // Prevent triggering multiple times
            if (!this.props.getQuestionsListStatus.loading && !this.props.getQuestionsListStatus.error &&
                this.props.questionsList!.lastTimestamp > 0) {
                this.props.loadMoreQuestionItems(this.props.questionsList!.lastTimestamp);
            }
        });
    }

    public componentWillMount() {
        if (!this.props.questionsList) {
            this.props.loadMoreQuestionItems();
        }
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.questionsList &&
            this.props.questionsList.lastTimestamp === 0 &&
            prevProps.questionsList &&
            prevProps.questionsList.lastTimestamp > 0) {
            // Reached the end of the list! Eat your heart out Twitter.
            this.props.onAllQuestionsLoaded();
        }
    }

    public render() {
        const questionList = this.props.questionsList;

        return (
            <>
                <h1>Recent questions</h1>
                {questionList &&
                    <ul className="list-unstyled">
                        <li className="mb-2">
                            <NewQuestion />
                        </li>
                        {questionList.questions.map((x: QuestionListItemModel, i: number) =>
                            <li key={i} className="mb-2">
                                {this.renderQuestion(x)}
                            </li>)}
                        {questionList.lastTimestamp === 0 && questionList.questions.length > 40 &&
                            <li>
                                That's all, folks!
                            </li>
                        }
                    </ul>
                }
                <ActionStatusDisplay {...this.props.getQuestionsListStatus} />
            </>
        );
    }

    private renderQuestion(question: QuestionListItemModel) {
        return (
            <>
                <div>
                    <small>
                        New question
                        {question.tags.length > 0 &&
                            <>{} in: {}
                                <ul className="list-inline list-comma-separated">
                                    {question.tags.map((x: TagValueModel, i: number) =>
                                        <li key={i} className="list-inline-item">
                                            <Link to={`/tags/${x.slug}`}>
                                                <b>{x.name}</b>
                                            </Link>
                                        </li>)}
                                </ul>
                            </>
                        }
                    </small>
                </div>
                <Link
                    to={buildQuestionUrl(question.id, question.slug)}
                    className="btn btn-lg btn-outline-secondary post-list-item"
                >
                    <Emoji value={EmojiValue.Question} />
                    <span className="ml-1 question quote-marks">{question.text}</span>
                    <small className="ml-1">
                        <span className="badge badge-info">{question.answersCount}</span>
                        <span className="sr-only">answers</span>
                    </small>
                </Link>
            </>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({
        ...state.questions,
        getQuestionsListStatus: getActionStatus(state, 'GET_QUESTIONS_LIST'),
    }),
    QuestionsStore.actionCreators,
)(QuestionList);
