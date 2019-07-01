import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { HQLabel } from '../hq-components';
import hqStyles from '../hq-styles';
import AgreeIcon from '../svg-icons/AgreeIcon';
import DisagreeIcon from '../svg-icons/DisagreeIcon';

interface Props {
  isAgree: boolean;
}

export default class AgreementLabel extends React.Component<Props> {

  public render() {
    const { isAgree } = this.props;

    return (
      <View style={[styles.pillStyle, hqStyles.flexRow]}>
        {isAgree ? <AgreeIcon /> : <DisagreeIcon />}
        <HQLabel style={[styles.textStyle, hqStyles.vAlignCenter]}>{isAgree ? 'Agree' : 'Disagree'}</HQLabel>
      </View>
    );
  }
}

const pillStyle: StyleProp<ViewStyle> = {
  borderWidth: 1,
  borderColor: '#2293A5',
  borderRadius: 10,
  padding: 5,
};
const textStyle: StyleProp<TextStyle> = {
  color: '#2293A5',
  fontSize: 11,
  marginLeft: 3,
};
const styles = StyleSheet.create({ pillStyle, textStyle });
