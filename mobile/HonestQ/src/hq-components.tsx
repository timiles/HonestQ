import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: '#28374B',
  },
  text: {
    color: '#FFFFFF',
  },
});

// tslint:disable:max-classes-per-file

export class HQContentView extends React.Component {
  public render() {
    return <View style={styles.contentView}>{this.props.children}</View>;
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
