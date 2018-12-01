import * as React from 'react';
import TextWithShortLinks from './TextWithShortLinks';

interface Props {
    value?: string;
}

export default class Source extends React.Component<Props, {}> {

    public render() {
        const { value } = this.props;
        if (!value) {
            return null;
        }

        return (
            <p className="small">
                <small>Source: </small><TextWithShortLinks value={value} />
            </p>
        );
    }
}
