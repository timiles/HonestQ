import React from 'react';
import QuotationMarkCloseIcon from './SvgIcons/QuotationMarkCloseIcon';
import QuotationMarkOpenIcon from './SvgIcons/QuotationMarkOpenIcon';

interface Props {
  width: number;
}

export default class QuotationMarks extends React.Component<Props> {

  public render() {
    const { width } = this.props;

    return (
      <>
        <span className="quotation-mark">
          <QuotationMarkOpenIcon width={width} />
        </span>
        {this.props.children}
        <span className="quotation-mark">
          <QuotationMarkCloseIcon width={width} />
        </span>
      </>
    );
  }
}
