import React from 'react';
import { View } from 'react-native';
import QuotationMarkCloseIcon from '../svg-icons/QuotationMarkCloseIcon';
import QuotationMarkOpenIcon from '../svg-icons/QuotationMarkOpenIcon';

interface Props {
  width: number;
}

export default class QuotationMarks extends React.Component<Props> {

  public render() {
    const { width } = this.props;
    const fill = '#AECCF5';

    return (
      <View style={{ flexDirection: 'row' }}>
        <QuotationMarkOpenIcon width={width} fill={fill} />
        {this.props.children}
        <QuotationMarkCloseIcon width={width} fill={fill} />
      </View>
    );
  }
}
