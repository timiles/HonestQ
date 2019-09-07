import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { HQCard } from '../hq-components';
import hqStyles from '../hq-styles';
import CircleIcon from './CircleIcon';

interface OwnProps {
  type: 'Q' | 'A';
  position?: 'top' | 'left';
}
type Props = OwnProps
  & ViewProps;

export default class CircleIconCard extends React.Component<Props> {

  public render() {
    const { type, position = 'top' } = this.props;
    const isTop = position === 'top';

    return (
      <HQCard style={[isTop ? hqStyles.mt2 : hqStyles.flexRow, this.props.style]}>
        <CircleIcon type={type} style={isTop ? styles.circleIconPositionTop : null} />
        <View style={[styles.content, isTop ? styles.contentPositionTop : null]}>
          {this.props.children}
        </View>
      </HQCard >
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  circleIconPositionTop: {
    top: -18,
    marginTop: 0,
    marginBottom: -18,
  } as ViewStyle,

  content: {
    flexShrink: 1,
    paddingBottom: 10,
  } as ViewStyle,

  contentPositionTop: {
    paddingHorizontal: 40,
  } as ViewStyle,
});
