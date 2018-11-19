import * as React from 'react';
import { extractDomainFromUrl } from '../../utils/string-utils';

interface Props {
    url: string;
}

export default class EmbeddedContentCard extends React.Component<Props, {}> {

    private static readonly embeddableDomains: string[] = ['twitter.com', 'vimeo.com', 'youtube.com'];

    public render() {
        const { url } = this.props;

        const domain = extractDomainFromUrl(url);
        if (!domain || EmbeddedContentCard.embeddableDomains.indexOf(domain) < 0) {
            return null;
        }

        return (
            <a href={url} className="embedly-card" data-card-controls="0" data-card-recommend="1" />
        );
    }
}
