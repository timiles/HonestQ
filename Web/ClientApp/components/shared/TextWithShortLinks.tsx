import * as React from 'react';
import { splitIntoAlternatingTextFragmentsAndUrls } from '../../utils/string-utils';
import ShortLink from './ShortLink';

interface Props {
    value: string;
}

export default class TextWithShortLinks extends React.Component<Props, {}> {

    public render() {
        const { value } = this.props;

        // Even indexes are text fragments, odd indexes are urls
        const textFragmentsAndUrls = splitIntoAlternatingTextFragmentsAndUrls(value);
        return textFragmentsAndUrls.map((x, i) =>
            (!x) ? null : (i % 2 === 0) ? <span key={i}>{x}</span> : <ShortLink key={i} to={x} />);
    }
}
