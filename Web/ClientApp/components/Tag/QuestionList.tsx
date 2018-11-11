import * as React from 'react';
import { Link } from 'react-router-dom';
import { QuestionListItemModel, TagValueModel } from '../../server-models';
import { buildQuestionUrl } from '../../utils/route-utils';
import NewQuestion from '../QuestionForm/NewQuestion';
import Emoji, { EmojiValue } from '../shared/Emoji';

interface Props {
    questions: QuestionListItemModel[];
    tagValue: TagValueModel;
}

export default class QuestionList extends React.Component<Props, {}> {

    public render() {
        const { questions, tagValue } = this.props;
        if (questions.length === 0) {
            return null;
        }

        return (
            <ul className="list-unstyled">
                {questions.map((x: QuestionListItemModel, i: number) =>
                    <li key={i} className="mb-2">
                        <Link
                            to={buildQuestionUrl(x.id, x.slug)}
                            className="btn btn-lg btn-outline-secondary post-list-item"
                        >
                            <Emoji value={EmojiValue.Question} />
                            <span className="ml-1 quote-marks">{x.text}</span>
                        </Link>
                    </li>)}
                <li>
                    <NewQuestion tagValue={tagValue} />
                </li>
            </ul>);
    }
}
