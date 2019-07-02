import React from 'react';
import { StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { HQCard } from '../hq-components';

export class InfoCard extends React.Component<ViewProps> {
  public render() {
    return <HQCard {...this.props} style={[styles.infoCard, this.props.style]}>{this.props.children}</HQCard>;
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  infoCard: {
    padding: 20,
    borderLeftWidth: 5,
    borderRadius: 5,
    borderLeftColor: '#5bc0de',
  } as ViewStyle,
});
