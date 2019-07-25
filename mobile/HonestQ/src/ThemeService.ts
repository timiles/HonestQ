import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export type Theme = 'dark' | 'light';

interface Styles {
  card: ViewStyle;
  contentView: ViewStyle;
  header: TextStyle;
  label: TextStyle;
  text: TextStyle;
  textInput: TextStyle;
}

export default class ThemeService {

  public static getTheme() {
    return this.theme;
  }

  public static setTheme(theme: Theme) {
    this.theme = theme;
    this.styles = ThemeService.createStyles();
  }

  public static getStyles(): Styles {
    return this.styles;
  }

  public static getBackgroundColor() {
    return this.theme === 'dark' ? '#28374B' : '#EDF6FB';
  }

  public static getBorderColor() {
    return this.theme === 'dark' ? '#394D67' : '#C9D4DD';
  }

  public static getNavTextColor() {
    return this.theme === 'dark' ? '#FFF' : '#00000080';
  }

  public static getTextColor() {
    return this.theme === 'dark' ? '#AECCF5' : '#757575';
  }

  private static theme: Theme;
  private static styles: Styles;

  private static createStyles(): Styles {
    const cardBackgroundColor = this.theme === 'dark' ? '#1F2B3A' : '#FFFFFF';
    const cardBorderColor = this.getBorderColor();
    const textColor = this.getTextColor();

    // tslint:disable:no-object-literal-type-assertion
    return StyleSheet.create({
      card: {
        backgroundColor: cardBackgroundColor,
        // Necessary to enable overriding each individually
        borderTopColor: cardBorderColor,
        borderRightColor: cardBorderColor,
        borderBottomColor: cardBorderColor,
        borderLeftColor: cardBorderColor,
        borderWidth: 1,
      } as ViewStyle,

      contentView: {
        flex: 1,
        backgroundColor: this.getBackgroundColor(),
      } as ViewStyle,

      header: {
        color: textColor,
        fontFamily: 'Nexa Bold',
        fontSize: 20,
      } as TextStyle,

      label: {
        color: textColor,
        fontFamily: 'Nexa Bold',
        fontSize: 14,
      } as TextStyle,

      text: {
        color: textColor,
        fontFamily: 'lineto-circular-book',
        fontSize: 14,
      } as TextStyle,

      textInput: {
        borderColor: textColor,
        borderRadius: 30,
        borderWidth: 1,
        padding: 10,
      } as TextStyle,

    });
  }
}
