import * as $ from 'jquery';
import * as React from 'react';
import { generateRandomHtmlId } from '../../utils/html-utils';
import { extractDomainFromUrl, extractUrlFromText } from '../../utils/string-utils';

interface Props {
    to: string;
}

export default class ShortLink extends React.Component<Props, {}> {

    private readonly tooltipId: string;

    constructor(props: Props) {
        super(props);

        this.tooltipId = generateRandomHtmlId('tooltip');
    }

    public componentDidMount() {
        $(`#${this.tooltipId}`).tooltip();
    }

    public render() {
        const { to } = this.props;
        const url = extractUrlFromText(to);

        if (!url) {
            // If it is not a URL, fall back to just the original text.
            return to;
        }

        const isPdf = (url.toLowerCase().indexOf('.pdf') >= 0);
        const domain = extractDomainFromUrl(url);
        return (
            <span>
                <a
                    id={this.tooltipId}
                    className="badge badge-info"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-toggle="tooltip"
                    data-placement="top"
                    title={url}
                >
                    🌐 {domain} {isPdf ? '(PDF)' : ''}
                </a>
            </span>
        );
    }
}
