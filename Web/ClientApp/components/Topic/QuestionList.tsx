import * as React from 'react';
import { Link } from 'react-router-dom';
import { QuestionListItemModel, TopicValueModel } from '../../server-models';
import Emoji, { EmojiValue } from '../shared/Emoji';
import NewQuestion from './NewQuestion';

interface Props {
    questions: QuestionListItemModel[];
    topicValue: TopicValueModel;
}

export default class QuestionList extends React.Component<Props, {}> {

    public render() {
        const { questions, topicValue } = this.props;
        if (questions.length === 0) {
            return null;
        }

        return (
            <>
                <ul className="list-unstyled">
                    {questions.map((x, i) =>
                        <li key={`question_${i}`} className="mb-2">
                            <Link
                                to={`/questions/${x.id}/${x.slug}`}
                                className="btn btn-lg btn-outline-secondary question-list-item"
                            >
                                <Emoji value={EmojiValue.Question} />
                                <span className="question">{x.text}</span>
                            </Link>
                        </li>)}
                    <li>
                        <NewQuestion topicValue={topicValue} />
                    </li>
                </ul>
            </>);
    }
}
