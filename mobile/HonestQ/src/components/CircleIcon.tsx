import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import hqColors from '../hq-colors';

interface OwnProps {
  type: 'Q' | 'A';
}
type Props = OwnProps
  & ViewProps;

export default class CircleIcon extends React.Component<Props> {

  public render() {
    const { type } = this.props;
    const backgroundColor = type === 'Q' ? hqColors.Orange : hqColors.Green;

    return (
      <View style={[styles.circleIcon, { backgroundColor }, this.props.style]}>
        <Text style={styles.circleText}>{type}</Text>
      </View>
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

  circleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'lineto-circular-book',
  } as TextStyle,
});
