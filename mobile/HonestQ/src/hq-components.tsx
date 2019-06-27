import React from 'react';
// tslint:disable-next-line:max-line-length
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle, View, ViewStyle } from 'react-native';

function createStyleSheet() {
  const contentView: StyleProp<ViewStyle> = {
    flex: 1,
    backgroundColor: '#28374B',
  };
  const header: StyleProp<TextStyle> = {
    color: '#AECCF5',
    fontFamily: 'Nexa Bold',
    fontSize: 20,
  };
  const label: StyleProp<TextStyle> = {
    color: '#AECCF5',
    fontFamily: 'Nexa Bold',
    fontSize: 14,
  };
  const text: StyleProp<TextStyle> = {
    color: '#AECCF5',
    fontFamily: 'lineto-circular-book',
    fontSize: 14,
  };
  return StyleSheet.create({ contentView, header, label, text });
}

const styles = createStyleSheet();

// tslint:disable:max-classes-per-file

export class HQContentView extends React.Component {
  public render() {
    return <View style={styles.contentView}>{this.props.children}</View>;
  }
}

export class HQHeader extends React.Component {
  public render() {
    return <Text style={styles.header}>{this.props.children}</Text>;
  }
}

export class HQLabel extends React.Component {
  public render() {
    return <Text style={styles.label}>{this.props.children}</Text>;
  }
}

export class HQText extends React.Component<TextProps> {
  public render() {
    const mergedStyle = { ...styles.text, ...this.props.style as object };
    return <Text {...this.props} style={mergedStyle}>{this.props.children}</Text>;
  }
}

export class HQTextInput extends React.Component<TextInputProps> {
  public render() {
    return <TextInput style={styles.text} {...this.props}>{this.props.children}</TextInput>;
  }
}
