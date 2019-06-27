import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { HQHeader, HQText } from '../hq-components';

interface Props {
  description?: string;
  moreInfoUrl?: string;
}

export default class MoreInfoCard extends React.Component<Props> {

  public render() {
    const { description, moreInfoUrl } = this.props;

    if (!description && !moreInfoUrl) {
      return null;
    }

    return (
      <View style={styles.containerStyle}>
        {description ?
          <>
            <HQHeader>Description</HQHeader>
            <HQText>{description}</HQText>
          </>
          : null
        }
        {description && moreInfoUrl ?
          <View style={{ height: 10 }} /> : null
        }
        {moreInfoUrl ?
          <>
            <HQHeader>More info</HQHeader>
            <HQText>{moreInfoUrl}</HQText>
          </>
          : null}
      </View>
    );
  }
}

const containerStyle: StyleProp<ViewStyle> = {
  marginVertical: 20,
  marginHorizontal: 10,
  padding: 20,
  borderWidth: 1,
  borderLeftWidth: 5,
  borderRadius: 5,
  backgroundColor: '#1f2b3a',
  borderTopColor: '#394D67',
  borderRightColor: '#394D67',
  borderBottomColor: '#394D67',
  borderLeftColor: '#5bc0de',
};
const styles = StyleSheet.create({ containerStyle });
