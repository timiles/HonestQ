import * as React from 'react';
import { Link } from 'react-router-dom';
import Emoji, { EmojiValue } from '../shared/Emoji';

interface BackToQuestionButtonProps {
    id: number;
    slug: string;
    text: string;
}

export default class BackToQuestionButton extends React.Component<BackToQuestionButtonProps, {}> {

    public render() {
        const { id, slug, text } = this.props;
        return (
            <Link
                to={`/questions/${id}/${slug}`}
                className="btn btn-md btn-outline-secondary btn-back-to-question mb-3"
            >
                &larr; <Emoji value={EmojiValue.Question} />
                <span className="ml-1 question-text">{text}</span>
            </Link>
        );
    }
}
