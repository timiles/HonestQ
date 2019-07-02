import React from 'react';
import { Alert, Linking, StyleSheet, TextStyle } from 'react-native';
import { HQText } from '../hq-components';
import { extractDomainFromUrl, extractExtensionFromUrl } from '../utils/string-utils';

interface Props {
  to: string;
}

export default class ShortLink extends React.Component<Props, {}> {

  private static readonly fileExtensions: string[] = [
    'gif',
    'jpg',
    'jpeg',
    'pdf',
    'png',
  ];

  public render() {
    const { to } = this.props;

    const domain = extractDomainFromUrl(to);
    const extension = extractExtensionFromUrl(to);
    const fileExtension = extension && ShortLink.fileExtensions.indexOf(extension) >= 0 ? extension : null;

    return (
      <HQText style={styles.link} onPress={() => Linking.openURL(to)} onLongPress={() => Alert.alert(to)}>
        🌐 {domain} {fileExtension ? `(${fileExtension.toUpperCase()})` : ''}
      </HQText>
    );
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  link: {
    backgroundColor: '#17a2b8',
    color: '#ffffff',
    borderRadius: 5,
    fontSize: 12,
    paddingHorizontal: 3,
  } as TextStyle,
});
