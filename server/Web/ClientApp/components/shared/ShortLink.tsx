import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
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

  private readonly tooltipRef: React.RefObject<HTMLAnchorElement>;

  constructor(props: Props) {
    super(props);

    this.tooltipRef = React.createRef<HTMLAnchorElement>();
  }

  public componentDidMount() {
    const tooltipElement = ReactDOM.findDOMNode(this.tooltipRef.current!) as Element;
    if (tooltipElement) {
      $(tooltipElement).tooltip();
    }
  }

  public render() {
    const { to } = this.props;

    const domain = extractDomainFromUrl(to);
    const extension = extractExtensionFromUrl(to);
    const fileExtension = extension && ShortLink.fileExtensions.indexOf(extension) >= 0 ? extension : null;

    return (
      <span>
        <a
          ref={this.tooltipRef}
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
