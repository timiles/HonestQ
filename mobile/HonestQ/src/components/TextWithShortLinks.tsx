import React from 'react';
import { View } from 'react-native';
import { HQText } from '../hq-components';
import { splitIntoAlternatingTextFragmentsAndUrls } from '../utils/string-utils';
import ShortLink from './ShortLink';

interface Props {
  value: string;
}

export default class TextWithShortLinks extends React.Component<Props, {}> {

  public render() {
    const { value } = this.props;

    // Even indexes are text fragments, odd indexes are urls
    const textFragmentsAndUrls = splitIntoAlternatingTextFragmentsAndUrls(value);
    return (
      <View style={{ flexDirection: 'row' }}>
        {textFragmentsAndUrls.map((x, i) =>
          // Use {x + i} for unique key as React gets confused with other nodes on page when e.g. re-ordering answers
          (!x) ? null : (i % 2 === 0) ? <HQText key={x + i}>{x}</HQText> : <ShortLink key={x + i} to={x} />)}
      </View>
    );
  }
}
