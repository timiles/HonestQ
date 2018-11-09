import * as React from 'react';
import { Link } from 'react-router-dom';

interface BackToQuestionButtonProps {
    id: number;
    slug: string;
}

export default class BackToQuestionButton extends React.Component<BackToQuestionButtonProps, {}> {

    public render() {
        const { id, slug } = this.props;
        return (
            <Link
                to={`/questions/${id}/${slug}`}
                className="btn btn-md btn-outline-secondary btn-block text-left mb-3"
            >
                &larr; <span className="ml-1">Back to the question</span>
            </Link>
        );
    }
}
