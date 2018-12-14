import * as $ from 'jquery';
import * as React from 'react';
import { generateRandomHtmlId } from '../../utils/html-utils';
import { extractDomainFromUrl, extractExtensionFromUrl } from '../../utils/string-utils';

interface Props {
    to: string;
}

export default class ShortLink extends React.Component<Props, {}> {

    private static readonly fileExtensions: string[] = [
        'gif',
        'jpg',
        'jpeg',
        'pdf',
        'png',
    ];

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

        const domain = extractDomainFromUrl(to);
        const extension = extractExtensionFromUrl(to);
        const fileExtension = extension && ShortLink.fileExtensions.indexOf(extension) >= 0 ? extension : null;

        return (
            <span>
                <a
                    id={this.tooltipId}
                    className="badge badge-info"
                    href={to}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-toggle="tooltip"
                    data-placement="top"
                    title={to}
                >
                    🌐 {domain} {fileExtension ? `(${fileExtension.toUpperCase()})` : ''}
                </a>
            </span>
        );
    }
}
