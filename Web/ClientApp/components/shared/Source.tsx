import * as React from 'react';
import { isUrl } from '../../utils/string-utils';
import ShortLink from './ShortLink';

interface Props {
    value?: string;
}

export default class Source extends React.Component<Props, {}> {

    private static splitIntoTextAndUrls(value: string): JSX.Element[] {
        const words = value.match(/\S+/g);
        if (!words) {
            // This shouldn't be possible but just in case.
            return [<span key={0}>{value}</span>];
        }

        const elements = new Array<JSX.Element>();
        let text = ' ';
        words.forEach((word) => {
            if (isUrl(word)) {
                if (text !== ' ' || elements.length > 0) {
                    elements.push(<span key={elements.length}>{text}</span>);
                    text = ' ';
                }
                elements.push(<ShortLink key={elements.length} to={word} />);
            } else {
                text += word + ' ';
            }
        });
        if (text !== ' ') {
            elements.push(<span key={elements.length}>{text}</span>);
        }

        return elements;
    }

    public render() {
        const { value } = this.props;
        if (!value) {
            return null;
        }

        return (
            <p className="small">
                <small>Source: </small>{Source.splitIntoTextAndUrls(value)}
            </p>
        );
    }
}
