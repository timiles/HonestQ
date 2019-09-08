import React from 'react';
import { StyleSheet, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import hqColors from '../hq-colors';
import { HQLabel } from '../hq-components';

export default class NewLabel extends React.Component<ViewProps> {

  public render() {
    return (
      <View style={[styles.countLabel, this.props.style]}>
        <HQLabel style={styles.countLabelText}>
          NEW
        </HQLabel>
      </View>
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  countLabel: {
    backgroundColor: hqColors.Orange,
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingTop: 2,
    borderRadius: 5,
  } as ViewStyle,

  countLabelText: {
    color: '#fff',
    fontSize: 12,
  } as TextStyle,
});
