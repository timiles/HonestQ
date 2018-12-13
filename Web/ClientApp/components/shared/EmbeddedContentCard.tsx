import * as React from 'react';
import { extractDomainFromUrl, extractExtensionFromUrl } from '../../utils/string-utils';

interface Props {
    url: string;
}

export default class EmbeddedContentCard extends React.Component<Props, {}> {

    private static readonly embeddableDomains: string[] = [
        'facebook.com',
        'honestq.com',
        'instagram.com',
        'twitter.com',
        'vimeo.com',
        'youtube.com',
    ];

    private static readonly embeddableExtensions: string[] = [
        'gif',
        'jpg',
        'jpeg',
        'png',
    ];

    private static shouldEmbedContent(url: string): boolean {
        const domain = extractDomainFromUrl(url);
        if (domain && EmbeddedContentCard.embeddableDomains.indexOf(domain) >= 0) {
            return true;
        }

        const extension = extractExtensionFromUrl(url);
        if (extension && EmbeddedContentCard.embeddableExtensions.indexOf(extension) >= 0) {
            return true;
        }

        return false;
    }

    public render() {
        const { url } = this.props;

        if (EmbeddedContentCard.shouldEmbedContent(url)) {
            return <a href={url} className="embedly-card" data-card-controls="0" data-card-recommend="1" />;
        }

        return null;
    }
}
