import React from 'react';
// tslint:disable-next-line:max-line-length
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

function createStyleSheet() {
  const contentView: StyleProp<ViewStyle> = {
    flex: 1,
    backgroundColor: '#28374B',
  };
  const card: StyleProp<ViewStyle> = {
    backgroundColor: '#1F2B3A',
    // Necessary to enable overriding each individually
    borderTopColor: '#394D67',
    borderRightColor: '#394D67',
    borderBottomColor: '#394D67',
    borderLeftColor: '#394D67',
    borderWidth: 1,
  };
  const infoCard: StyleProp<ViewStyle> = {
    padding: 20,
    borderLeftWidth: 5,
    borderRadius: 5,
    borderLeftColor: '#5bc0de',
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
  return StyleSheet.create({ contentView, card, infoCard, header, label, text });
}

const styles = createStyleSheet();

// tslint:disable:max-classes-per-file

export class HQContentView extends React.Component {
  public render() {
    return <View style={styles.contentView}>{this.props.children}</View>;
  }
}

export class HQCard extends React.Component<ViewProps> {
  public render() {
    const mergedStyle = { ...styles.card, ...this.props.style as object };
    return <View {...this.props} style={mergedStyle}>{this.props.children}</View>;
  }
}

export class HQInfoCard extends React.Component {
  public render() {
    return <HQCard style={styles.infoCard}>{this.props.children}</HQCard>;
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
