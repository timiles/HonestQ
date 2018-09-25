import * as React from 'react';
import { Link } from 'react-router-dom';

interface BackToQuestionButtonProps {
    id: number;
    slug: string;
    text: string;
}

export default class BackToQuestionButton extends React.Component<BackToQuestionButtonProps, {}> {

    public render() {
        const { id, slug, text } = this.props;
        return (

            <Link to={`/questions/${id}/${slug}`} className="btn btn-md btn-outline-secondary btn-back-to-pop mb-3">
                &larr; <span className="pop-text">{text}</span>
            </Link>
        );
    }
}
