import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import hqColors from '../hq-colors';
import ThemeService from '../ThemeService';

type CircleIconType = '?' | 'Q' | 'A' | '#';
interface OwnProps {
  type: CircleIconType;
}
type Props = OwnProps
  & ViewProps;

export default class CircleIcon extends React.Component<Props> {

  public render() {
    const { type } = this.props;
    const backgroundColor = this.getBackgroundColor(type);

    return (
      <View style={[styles.circleIcon, { backgroundColor }, this.props.style]}>
        <Text style={styles.circleText}>{type}</Text>
      </View>
    );
  }

  private getBackgroundColor(type: CircleIconType) {
    switch (type) {
      case '?':
      case '#':
      case 'Q': return hqColors.Orange;
      case 'A': return hqColors.Green;
      default: return ThemeService.getNavTextColor();
    }
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
