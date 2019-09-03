import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import hqStyles from '../hq-styles';
import QuotationMarkCloseIcon from '../svg-icons/QuotationMarkCloseIcon';
import QuotationMarkOpenIcon from '../svg-icons/QuotationMarkOpenIcon';
import ThemeService from '../ThemeService';

type Size = 'xsmall' | 'small' | 'large';
interface Props {
  size: Size;
}

export default class QuotationMarks extends React.Component<Props> {

  public render() {
    const { size } = this.props;
    const width = this.switchSize(size);
    const fill = ThemeService.getTextColor();
    const childrenContainerStyle = size === 'xsmall' ? styles.xsmallChildrenContainer : styles.childrenContainer;

    return (
      <View style={hqStyles.flexRow}>
        <QuotationMarkOpenIcon width={width} fill={fill} />
        <View style={[hqStyles.flexShrink, childrenContainerStyle]}>
          {this.props.children}
        </View>
        <QuotationMarkCloseIcon width={width} fill={fill} />
      </View>
    );
  }

  private switchSize(size: Size) {
    switch (size) {
      case 'xsmall': return 10;
      case 'small': return 16;
      case 'large': return 20;
    }
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  xsmallChildrenContainer: {
    paddingHorizontal: 4,
  } as ViewStyle,

  childrenContainer: {
    paddingHorizontal: 8,
  } as ViewStyle,
});
