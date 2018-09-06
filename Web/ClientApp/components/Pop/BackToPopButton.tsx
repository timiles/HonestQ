import * as React from 'react';
import { Link } from 'react-router-dom';

interface BackToPopButtonProps {
    id: number;
    slug: string;
    text: string;
}

export default class BackToPopButton extends React.Component<BackToPopButtonProps, {}> {

    public render() {
        const { id, slug, text } = this.props;
        return (

            <Link to={`/pops/${id}/${slug}`} className="btn btn-md btn-outline-secondary btn-back-to-pop mb-3">
                &larr; <span className="pop-text">{text}</span>
            </Link>
        );
    }
}
