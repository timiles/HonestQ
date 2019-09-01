import React from 'react';
import EmbeddedContent from '../shared/EmbeddedContent';
import TextWithShortLinks from '../shared/TextWithShortLinks';

interface Props {
  value?: string;
}

export default class Context extends React.Component<Props, {}> {

  public render() {
    const { value } = this.props;
    if (!value) {
      return null;
    }

    return (
      <div className="bs-callout bs-callout-info light-dark-bg">
        <h4>Context</h4>
        <TextWithShortLinks value={value} />
        <EmbeddedContent value={value} />
      </div>
    );
  }
}
