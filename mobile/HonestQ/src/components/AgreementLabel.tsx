import React from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
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
      <View style={[styles.pill, hqStyles.flexRow]}>
        {isAgree ? <AgreeIcon /> : <DisagreeIcon />}
        <HQLabel style={[styles.text, hqStyles.vAlignCenter]}>{isAgree ? 'Agree' : 'Disagree'}</HQLabel>
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
    padding: 5,
  } as ViewStyle,

  text: {
    color: '#2293A5',
    fontSize: 11,
    marginLeft: 3,
  } as TextStyle,
});
