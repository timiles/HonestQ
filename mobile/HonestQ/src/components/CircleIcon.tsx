import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface OwnProps {
  type: 'Q' | 'A';
}

export default class CircleIcon extends React.Component<OwnProps> {

  public render() {
    const { type } = this.props;
    const backgroundColor = type === 'Q' ? '#FF5A00' : '#12BC62';

    return (
      <View style={{ ...styles.circleIcon, backgroundColor }}>
        <Text style={styles.circleText}>{type}</Text>
      </View>
    );
  }
}

const circleIcon: StyleProp<ViewStyle> = {
  width: 36,
  height: 36,
  borderRadius: 18,
  top: -18,
  marginBottom: -18,
  left: 5,
  alignItems: 'center',
  justifyContent: 'center',
};
const circleText: StyleProp<TextStyle> = {
  color: '#FFFFFF',
  fontSize: 24,
  fontFamily: 'lineto-circular-book',
};
const styles = StyleSheet.create({ circleIcon, circleText });
