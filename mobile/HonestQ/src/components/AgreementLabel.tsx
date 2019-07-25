import React from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { HQLabel } from '../hq-components';
import hqStyles from '../hq-styles';
import AgreeIcon from '../svg-icons/AgreeIcon';
import DisagreeIcon from '../svg-icons/DisagreeIcon';

interface Props {
  isAgree: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export default class AgreementLabel extends React.Component<Props> {

  public render() {
    const { isAgree, disabled, size, showLabel = true } = this.props;
    const disabledColor = '#555';
    const fill = disabled ? disabledColor : undefined;
    const fontSize = (size === 'medium') ? styles.mediumFontSize : styles.smallFontSize;

    return (
      <View style={[styles.pill, hqStyles.flexRow, disabled ? { borderColor: disabledColor } : null]}>
        {isAgree ? <AgreeIcon fill={fill} /> : <DisagreeIcon fill={fill} />}
        {showLabel && (
          <HQLabel style={[styles.text, fontSize, hqStyles.vAlignCenter, disabled ? { color: disabledColor } : null]}>
            {isAgree ? 'Agree' : 'Disagree'}
          </HQLabel>
        )}
      </View>
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderColor: '#2293A5',
    borderRadius: 10,
    height: 30,
    padding: 5,
  } as ViewStyle,

  text: {
    color: '#2293A5',
    marginLeft: 3,
  } as TextStyle,

  smallFontSize: {
    fontSize: 11,
  } as TextStyle,

  mediumFontSize: {
    fontSize: 14,
  } as TextStyle,
});
