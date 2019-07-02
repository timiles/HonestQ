import React from 'react';
// tslint:disable-next-line:max-line-length
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewProps, ViewStyle } from 'react-native';
import hqStyles from './hq-styles';

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  button: {
    borderColor: '#6c757d',
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
  } as ViewStyle,

  contentView: {
    flex: 1,
    backgroundColor: '#28374B',
  } as ViewStyle,

  card: {
    backgroundColor: '#1F2B3A',
    // Necessary to enable overriding each individually
    borderTopColor: '#394D67',
    borderRightColor: '#394D67',
    borderBottomColor: '#394D67',
    borderLeftColor: '#394D67',
    borderWidth: 1,
  } as ViewStyle,

  header: {
    color: '#AECCF5',
    fontFamily: 'Nexa Bold',
    fontSize: 20,
  } as TextStyle,

  label: {
    color: '#AECCF5',
    fontFamily: 'Nexa Bold',
    fontSize: 14,
  } as TextStyle,

  text: {
    color: '#AECCF5',
    fontFamily: 'lineto-circular-book',
    fontSize: 14,
  } as TextStyle,

  textInput: {
    borderColor: '#AECCF5',
    borderRadius: 30,
    borderWidth: 1,
    padding: 10,
  } as TextStyle,
});

// tslint:disable:max-classes-per-file

export class HQButton extends React.Component<TouchableOpacityProps & { title?: string }> {
  public render() {
    const { title } = this.props;
    return (
      <TouchableOpacity {...this.props} style={[styles.button, this.props.style]}>
        {title ? <HQText>{title}</HQText> : this.props.children}
      </TouchableOpacity>
    );
  }
}

export class HQContentView extends React.Component<ViewProps> {
  public render() {
    return <View {...this.props} style={[styles.contentView, this.props.style]}>{this.props.children}</View>;
  }
}

export class HQCard extends React.Component<ViewProps> {
  public render() {
    return <View {...this.props} style={[styles.card, this.props.style]}>{this.props.children}</View>;
  }
}

export class HQHeader extends React.Component<ViewProps> {
  public render() {
    return <Text {...this.props} style={[styles.header, this.props.style]}>{this.props.children}</Text>;
  }
}

export class HQLabel extends React.Component<TextProps> {
  public render() {
    return <Text {...this.props} style={[styles.label, this.props.style]}>{this.props.children}</Text>;
  }
}

export class HQText extends React.Component<TextProps> {
  public render() {
    return <Text {...this.props} style={[styles.text, this.props.style]}>{this.props.children}</Text>;
  }
}

interface HQTextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
  submitted?: boolean;
}
export class HQTextInput extends React.Component<TextInputProps & HQTextInputProps> {
  public render() {
    const { containerStyle, error, submitted } = this.props;
    const errorStyle: StyleProp<TextStyle> = submitted ? { borderColor: error ? 'red' : 'green' } : null;

    return (
      <View style={containerStyle}>
        <TextInput
          placeholderTextColor="#AECCF5"
          {...this.props}
          style={[styles.text, styles.textInput, this.props.style, errorStyle]}
        >
          {this.props.children}
        </TextInput>
        {submitted && error && <Text style={hqStyles.error}>{error}</Text>}
      </View>
    );
  }
}
