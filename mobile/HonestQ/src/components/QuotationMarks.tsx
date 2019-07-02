import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import hqStyles from '../hq-styles';
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
