import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { HQCard } from '../hq-components';
import hqStyles from '../hq-styles';
import CircleIcon from './CircleIcon';

interface OwnProps {
  type: 'Q' | 'A';
}
type Props = OwnProps
  & ViewProps;

export default class TopCircleIconCard extends React.Component<Props> {

  public render() {
    const { type } = this.props;

    return (
      <HQCard style={[hqStyles.mt2, this.props.style]}>
        <CircleIcon type={type} style={styles.circleIconOffset} />
        <View style={[hqStyles.flexShrink, hqStyles.m1, hqStyles.pl3]}>
          {this.props.children}
        </View>
      </HQCard>
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  circleIconOffset: {
    top: -18,
    marginTop: 0,
    marginBottom: -36,
  } as ViewStyle,
});
