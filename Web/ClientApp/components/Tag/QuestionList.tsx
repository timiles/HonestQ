import * as React from 'react';
import { Link } from 'react-router-dom';
import { QuestionListItemModel } from '../../server-models';
import { buildQuestionUrl } from '../../utils/route-utils';
import { getItemCountText } from '../../utils/string-utils';
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
                    <li key={i} className="mb-4">
                        <div className="card light-dark-bg brand-font-color">
                            <CircleIcon className="float-left mr-3" value={CircleIconValue.Question} />
                            <div className="card-body px-sm-5">
                                <p>{x.text}</p>
                                <Link
                                    to={buildQuestionUrl(x.id, x.slug)}
                                    className="btn btn-outline-secondary"
                                >
                                    {getItemCountText('answer', x.answersCount)}
                                </Link>
                            </div>
                        </div>
                    </li>)}
            </ul>);
    }
}
