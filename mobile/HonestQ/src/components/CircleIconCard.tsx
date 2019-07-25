import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import { HQCard } from '../hq-components';
import hqStyles from '../hq-styles';

interface OwnProps {
  type: 'Q' | 'A';
  position?: 'top' | 'left';
}
type Props = OwnProps
  & ViewProps;

export default class CircleIconCard extends React.Component<Props> {

  public render() {
    const { type, position = 'top' } = this.props;
    const backgroundColor = type === 'Q' ? '#FF5A00' : '#12BC62';
    const isTop = position === 'top';

    return (
      <HQCard style={[isTop ? hqStyles.mt2 : hqStyles.flexRow, this.props.style]}>
        <View style={[styles.circleIcon, isTop ? styles.circleIconPositionTop : null, { backgroundColor }]}>
          <Text style={styles.circleText}>{type}</Text>
        </View>
        <View style={[styles.content, isTop ? styles.contentPositionTop : null]}>
          {this.props.children}
        </View>
      </HQCard >
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  circleIcon: {
    margin: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  circleIconPositionTop: {
    top: -18,
    marginTop: 0,
    marginBottom: -18,
  } as ViewStyle,

  circleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'lineto-circular-book',
  } as TextStyle,

  content: {
    flexShrink: 1,
    paddingBottom: 10,
  } as ViewStyle,

  contentPositionTop: {
    paddingHorizontal: 40,
  } as ViewStyle,
});
