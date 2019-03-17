import * as React from 'react';
import { Link } from 'react-router-dom';
import { QuestionListItemModel, TagValueModel } from '../../server-models';
import { buildQuestionUrl } from '../../utils/route-utils';
import NewQuestion from '../QuestionForm/NewQuestion';
import CircleTag, { CircleTagValue } from '../shared/CircleTag';

interface Props {
    questions: QuestionListItemModel[];
    tagValue: TagValueModel;
}

export default class QuestionList extends React.Component<Props, {}> {

    public render() {
        const { questions, tagValue } = this.props;

        return (
            <ul className="list-unstyled">
                {questions.map((x: QuestionListItemModel, i: number) =>
                    <li key={i} className="mb-2">
                        <Link
                            to={buildQuestionUrl(x.id, x.slug)}
                            className="btn btn-lg btn-outline-secondary post-list-item"
                        >
                            <CircleTag className="float-left mr-2" value={CircleTagValue.Question} />
                            <span className="quote-marks">{x.text}</span>
                        </Link>
                    </li>)}
                <li>
                    <NewQuestion tagValue={tagValue} />
                </li>
            </ul>);
    }
}
