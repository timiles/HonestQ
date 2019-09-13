import { NamedColor } from 'csstype';
import React from 'react';
import { StyleSheet, Switch, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import hqColors from '../hq-colors';
import { HQLabel } from '../hq-components';
import hqStyles from '../hq-styles';
import AgreeIcon from '../svg-icons/AgreeIcon';
import DisagreeIcon from '../svg-icons/DisagreeIcon';

interface Props {
  isAgree: boolean;
  onSwitch?: (isAgree: boolean) => void;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export default class AgreementLabel extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.handleSwitch = this.handleSwitch.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  public render() {
    const { isAgree, onSwitch, size, showLabel = true } = this.props;
    const fontSize = (size === 'medium') ? styles.mediumFontSize : styles.smallFontSize;
    const trackColor: NamedColor = 'lightgray';

    const agreementLabel = (
      <View style={[styles.pill, hqStyles.row]}>
        {onSwitch &&
          <Switch
            value={!isAgree}
            thumbColor={hqColors.AgreementLabelBlue}
            trackColor={{ true: trackColor, false: trackColor }}
            ios_backgroundColor={trackColor}
            onValueChange={this.handleSwitch}
          />
        }
        {isAgree ? <AgreeIcon /> : <DisagreeIcon />}
        {showLabel &&
          <HQLabel style={[styles.text, fontSize, hqStyles.vAlignCenter]}>
            {isAgree ? 'Agree' : 'Disagree'}
          </HQLabel>
        }
      </View>
    );

    if (!onSwitch) {
      return agreementLabel;
    }

    return (
      <TouchableOpacity
        onPress={this.handleToggle}
        activeOpacity={1}
      >
        {agreementLabel}
      </TouchableOpacity>
    );
  }

  private handleSwitch(on: boolean) {
    this.props.onSwitch(!on);
  }
  private handleToggle() {
    this.props.onSwitch(!this.props.isAgree);
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderColor: hqColors.AgreementLabelBlue,
    borderRadius: 5,
    height: 30,
    padding: 5,
  } as ViewStyle,

  text: {
    color: hqColors.AgreementLabelBlue,
    marginLeft: 3,
  } as TextStyle,

  smallFontSize: {
    fontSize: 11,
  } as TextStyle,

  mediumFontSize: {
    fontSize: 14,
  } as TextStyle,
});
