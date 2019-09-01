import React from 'react';
import { extractUrlsFromText } from '../../utils/string-utils';
import EmbeddedContentCard from './EmbeddedContentCard';

interface Props {
  value?: string;
}

export default class EmbeddedContent extends React.Component<Props, {}> {

  public render() {
    const { value } = this.props;

    if (!value) {
      return null;
    }

    const urls = extractUrlsFromText(value);
    return urls.map((x, i) => <EmbeddedContentCard key={i} url={x} />);
  }
}
