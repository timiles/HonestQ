import * as $ from 'jquery';
import * as React from 'react';
import { generateRandomHtmlId } from '../../utils/html-utils';
import { extractDomainFromUrl } from '../../utils/string-utils';

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

        const isPdf = (to.toLowerCase().indexOf('.pdf') >= 0);
        const domain = extractDomainFromUrl(to);
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
                    🌐 {domain} {isPdf ? '(PDF)' : ''}
                </a>
            </span>
        );
    }
}
