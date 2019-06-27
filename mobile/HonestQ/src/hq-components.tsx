import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

function createStyleSheet() {
  const contentView: StyleProp<ViewStyle> = {
    flex: 1,
    backgroundColor: '#28374B',
  };
  const label: StyleProp<TextStyle> = {
    color: '#FFFFFF',
    fontFamily: 'Nexa Bold',
  };
  const text: StyleProp<TextStyle> = {
    color: '#FFFFFF',
    fontFamily: 'lineto-circular-book',
  };
  return StyleSheet.create({ contentView, label, text });
}

const styles = createStyleSheet();

// tslint:disable:max-classes-per-file

export class HQContentView extends React.Component {
  public render() {
    return <View style={styles.contentView}>{this.props.children}</View>;
  }
}

export class HQLabel extends React.Component {
  public render() {
    return <Text style={styles.label}>{this.props.children}</Text>;
  }
}

export class HQText extends React.Component {
  public render() {
    return <Text style={styles.text}>{this.props.children}</Text>;
  }
}

export class HQTextInput extends React.Component<TextInputProps> {
  public render() {
    return <TextInput style={styles.text} {...this.props}>{this.props.children}</TextInput>;
  }
}
