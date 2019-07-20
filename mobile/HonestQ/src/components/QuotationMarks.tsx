import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import hqStyles from '../hq-styles';
import QuotationMarkCloseIcon from '../svg-icons/QuotationMarkCloseIcon';
import QuotationMarkOpenIcon from '../svg-icons/QuotationMarkOpenIcon';
import ThemeService from '../ThemeService';

interface Props {
  size: 'small' | 'large';
}

export default class QuotationMarks extends React.Component<Props> {

  public render() {
    const { size } = this.props;
    const width = (size === 'small') ? 16 : 20;
    const fill = ThemeService.getTextColor();

    return (
      <View style={hqStyles.flexRow}>
        <QuotationMarkOpenIcon width={width} fill={fill} />
        <View style={styles.childrenContainer}>
          {this.props.children}
        </View>
        <QuotationMarkCloseIcon width={width} fill={fill} />
      </View>
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  childrenContainer: {
    paddingHorizontal: 8,
  } as ViewStyle,
});
