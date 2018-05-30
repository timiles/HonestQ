import * as React from 'react';

interface Props {
    url: string;
}

export default class EmbeddedContentCard extends React.Component<Props, {}> {

    public render() {
        const { url } = this.props;
        return (<a href={url} className="embedly-card" data-card-controls="0" data-card-recommend="1">{url}</a>);
    }
}
