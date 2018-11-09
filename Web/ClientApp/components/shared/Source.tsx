import * as React from 'react';
import ShortLink from './ShortLink';

interface Props {
    value?: string;
}

export default class Source extends React.Component<Props, {}> {

    public render() {
        const { value } = this.props;
        if (!value) {
            return null;
        }
        return <p className="small"><small>Source: </small><ShortLink to={value} /></p>;
    }
}
