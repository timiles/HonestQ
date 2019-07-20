import React from 'react';
// tslint:disable-next-line:max-line-length
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewProps, ViewStyle } from 'react-native';
import hqStyles from './hq-styles';

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
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

  navigationButton: {
    borderColor: '#6c757d',
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
  } as ViewStyle,

  primaryButton: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    padding: 12,
  } as ViewStyle,

  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    height: 45,
    padding: 12,
  } as ViewStyle,

  submitButtonText: {
    color: '#fff',
    textAlignVertical: 'center',
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

export class HQNavigationButton extends React.Component<TouchableOpacityProps & { title?: string }> {
  public render() {
    const { title } = this.props;
    return (
      <TouchableOpacity {...this.props} style={[styles.navigationButton, this.props.style]}>
        {title ? <HQText>{title}</HQText> : this.props.children}
      </TouchableOpacity>
    );
  }
}

export class HQPrimaryButton extends React.Component<TouchableOpacityProps & { title?: string }> {
  public render() {
    const { title } = this.props;
    return (
      <TouchableOpacity {...this.props} style={[styles.primaryButton, this.props.style]}>
        {title ? <HQText style={hqStyles.primaryButtonText}>{title}</HQText> : this.props.children}
      </TouchableOpacity>
    );
  }
}

interface HQSubmitButtonProps {
  title?: string;
  submitting?: boolean;
  activityIndicatorColor?: string;
}
export class HQSubmitButton extends React.Component<TouchableOpacityProps & HQSubmitButtonProps> {
  public render() {
    const { title, submitting = false, activityIndicatorColor = '#fff' } = this.props;

    return (
      <TouchableOpacity {...this.props} style={[styles.submitButton, this.props.style]}>
        {title ? <HQText style={styles.submitButtonText}>{title}</HQText> : this.props.children}
        {submitting && <ActivityIndicator animating={true} color={activityIndicatorColor} style={hqStyles.ml1} />}
      </TouchableOpacity>
    );
  }
}

interface HQSuperTextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  helpText?: string;
  error?: string;
  submitted?: boolean;
}
interface HQSuperTextInputState {
  widthForCopyPasteHackFix: string;
}
export class HQSuperTextInput extends React.Component<TextInputProps & HQSuperTextInputProps, HQSuperTextInputState> {

  constructor(props: TextInputProps & HQSuperTextInputProps) {
    super(props);

    this.state = { widthForCopyPasteHackFix: '99%' };
  }

  public componentDidMount() {
    // BUG: https://github.com/facebook/react-native/issues/23653
    // HACKY FIX: https://gist.github.com/ilya-uryupov/7bc9515c6d315d4919ff56ebf4e20411
    setTimeout(() => {
      this.setState({ widthForCopyPasteHackFix: '100%' });
    }, 1);
  }

  public render() {
    const { containerStyle, helpText, error, submitted, maxLength, value } = this.props;
    const { widthForCopyPasteHackFix: widthHack } = this.state;

    const exceededCharacterCount = value && value.length > maxLength;
    const remainingCharacterCountStyle: StyleProp<TextStyle> =
      exceededCharacterCount ? { color: 'red' } :
        submitted && !error ? { color: 'green' } : null;
    const errorStyle: StyleProp<TextStyle> =
      exceededCharacterCount ? { borderColor: 'red' } :
        submitted ? { borderColor: error ? 'red' : 'green' } : null;

    const remainingCharacterCount = maxLength - (value ? value.length : 0);

    return (
      <View style={containerStyle}>
        {helpText && <HQText style={[hqStyles.small, hqStyles.ml1]}>{helpText}</HQText>}
        <TextInput
          placeholderTextColor="#AECCF5"
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          {...this.props}
          maxLength={undefined} // Must be after {...this.props} to override
          style={[styles.text, styles.textInput, this.props.style, errorStyle, { width: widthHack }]}
        >
          {this.props.children}
        </TextInput>
        <View style={hqStyles.flexRowPullRight}>
          <HQLabel style={remainingCharacterCountStyle}>
            {remainingCharacterCount} characters remaining
          </HQLabel>
        </View>
        {submitted && error && <HQText style={[hqStyles.error, hqStyles.ml1]}>{error}</HQText>}
      </View>
    );
  }
}

export class HQText extends React.Component<TextProps> {
  public render() {
    return <Text {...this.props} style={[styles.text, this.props.style]}>{this.props.children}</Text>;
  }
}

interface HQTextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  helpText?: string;
  error?: string;
  submitted?: boolean;
}
export class HQTextInput extends React.Component<TextInputProps & HQTextInputProps> {
  public render() {
    const { containerStyle, helpText, error, submitted } = this.props;
    const errorStyle: StyleProp<TextStyle> = submitted ? { borderColor: error ? 'red' : 'green' } : null;

    return (
      <View style={containerStyle}>
        {helpText && <HQText style={[hqStyles.small, hqStyles.ml1]}>{helpText}</HQText>}
        <TextInput
          placeholderTextColor="#AECCF5"
          {...this.props}
          style={[styles.text, styles.textInput, this.props.style, errorStyle]}
        >
          {this.props.children}
        </TextInput>
        {submitted && error && <HQText style={[hqStyles.error, hqStyles.ml1]}>{error}</HQText>}
      </View>
    );
  }
}
