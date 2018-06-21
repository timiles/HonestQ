import * as React from 'react';
import { Link } from 'react-router-dom';

export interface BackToTopicProps {
    slug: string;
    name: string;
}

export default class BackToTopic extends React.Component<BackToTopicProps, {}> {

    public render() {
        const { slug, name } = this.props;
        return (
            <Link to={`/${slug}`} className="btn btn-md btn-outline-secondary btn-back-to-topic">
                &larr; Back to other statements about <span className="topic-name">{name}</span>
            </Link>
        );
    }
}
