import React from 'react';
import WatchControl from './WatchControl';

interface State {
    watching: boolean;
}

export default class WatchControlDemo extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = { watching: false };

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { watching } = this.state;

        return (
            <WatchControl
                watching={watching}
                onWatch={this.handleWatch}
            />
        );
    }

    private handleWatch(on: boolean): void {
        this.setState({ watching: on });
    }
}
