import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
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
      <HQCard style={[styles.card, this.props.style]}>
        <View style={[styles.circleIcon, { backgroundColor }]}>
          <Text style={styles.circleText}>{type}</Text>
        </View>
        <View style={styles.content}>
          {this.props.children}
        </View>
      </HQCard>
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  card: {
    marginTop: 20,
  } as ViewStyle,

  circleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    top: -18,
    marginBottom: -18,
    left: 5,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  circleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'lineto-circular-book',
  } as TextStyle,

  content: {
    paddingHorizontal: 40,
    paddingBottom: 10,
  } as ViewStyle,
});
