import React from 'react';
// tslint:disable-next-line:max-line-length
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewProps, ViewStyle } from 'react-native';
import hqColors from './hq-colors';
import hqStyles from './hq-styles';
import ThemeService from './ThemeService';

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
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
    flexDirection: 'row',
    height: 45,
    padding: 12,
  } as ViewStyle,

  submitButtonText: {
    color: '#fff',
    textAlignVertical: 'center',
  } as TextStyle,
});

// tslint:disable:max-classes-per-file

export class HQActivityIndicator extends React.Component {
  public render() {
    return (
      <ActivityIndicator size="large" color={hqColors.Orange} />
    );
  }
}

export class HQLoadingView extends React.Component {
  public render() {
    return (
      <View style={[ThemeService.getStyles().contentView, hqStyles.center]}>
        <HQActivityIndicator />
      </View>
    );
  }
}

export class HQCard extends React.Component<ViewProps> {
  public render() {
    return (
      <View
        {...this.props}
        style={[ThemeService.getStyles().card, this.props.style]}
      >
        {this.props.children}
      </View>
    );
  }
}

export class HQHeader extends React.Component<ViewProps> {
  public render() {
    return (
      <Text
        {...this.props}
        style={[ThemeService.getStyles().header, this.props.style]}
      >
        {this.props.children}
      </Text>
    );
  }
}

export class HQLabel extends React.Component<TextProps> {
  public render() {
    return (
      <Text
        {...this.props}
        style={[ThemeService.getStyles().label, this.props.style]}
      >
        {this.props.children}
      </Text>
    );
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
    const themeStyles = ThemeService.getStyles();

    return (
      <View style={containerStyle}>
        {helpText && <HQText style={[hqStyles.small, hqStyles.ml1]}>{helpText}</HQText>}
        <TextInput
          placeholderTextColor={ThemeService.getTextColor()}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          {...this.props}
          maxLength={undefined} // Must be after {...this.props} to override
          style={[themeStyles.text, themeStyles.textInput, this.props.style, errorStyle, { width: widthHack }]}
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
    return <Text {...this.props} style={[ThemeService.getStyles().text, this.props.style]}>{this.props.children}</Text>;
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
          placeholderTextColor={ThemeService.getTextColor()}
          {...this.props}
          style={[ThemeService.getStyles().text, ThemeService.getStyles().textInput, this.props.style, errorStyle]}
        >
          {this.props.children}
        </TextInput>
        {submitted && error && <HQText style={[hqStyles.error, hqStyles.ml1]}>{error}</HQText>}
      </View>
    );
  }
}
