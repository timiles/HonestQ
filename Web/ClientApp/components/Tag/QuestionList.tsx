import * as React from 'react';
import { Link } from 'react-router-dom';
import { QuestionListItemModel } from '../../server-models';
import { buildQuestionUrl } from '../../utils/route-utils';
import CircleIcon, { CircleIconValue } from '../shared/CircleIcon';

interface Props {
    questions: QuestionListItemModel[];
}

export default class QuestionList extends React.Component<Props, {}> {

    public render() {
        const { questions } = this.props;

        return (
            <ul className="list-unstyled">
                {questions.map((x: QuestionListItemModel, i: number) =>
                    <li key={i} className="mb-2">
                        <Link
                            to={buildQuestionUrl(x.id, x.slug)}
                            className="btn btn-lg btn-outline-secondary post-list-item brand-font-color"
                        >
                            <CircleIcon className="float-left mr-3" value={CircleIconValue.Question} />
                            <span>{x.text}</span>
                        </Link>
                    </li>)}
            </ul>);
    }
}
