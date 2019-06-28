import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import { HQCard } from '../hq-components';

interface OwnProps {
  type: 'Q' | 'A';
}
type Props = OwnProps
  & ViewProps;

export default class CircleIconCard extends React.Component<Props> {

  public render() {
    const { type } = this.props;
    const backgroundColor = type === 'Q' ? '#FF5A00' : '#12BC62';

    return (
      <HQCard style={[styles.cardStyle, this.props.style]}>
        <View style={[styles.circleIconStyle, { backgroundColor }]}>
          <Text style={styles.circleTextStyle}>{type}</Text>
        </View>
        <View style={styles.contentStyle}>
          {this.props.children}
        </View>
      </HQCard>
    );
  }
}

const cardStyle: StyleProp<ViewStyle> = {
  marginTop: 20,
};
const circleIconStyle: StyleProp<ViewStyle> = {
  width: 36,
  height: 36,
  borderRadius: 18,
  top: -18,
  marginBottom: -18,
  left: 5,
  alignItems: 'center',
  justifyContent: 'center',
};
const circleTextStyle: StyleProp<TextStyle> = {
  color: '#FFFFFF',
  fontSize: 24,
  fontFamily: 'lineto-circular-book',
};
const contentStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 40,
  paddingBottom: 10,
};
const styles = StyleSheet.create({ cardStyle, circleIconStyle, circleTextStyle, contentStyle });
