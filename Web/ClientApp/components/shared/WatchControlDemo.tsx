import * as React from 'react';
import WatchControl from './WatchControl';

interface State {
    isWatchedByLoggedInUser: boolean;
}

export default class WatchControlDemo extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = { isWatchedByLoggedInUser: false };

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { isWatchedByLoggedInUser } = this.state;

        return (
            <WatchControl
                isWatchedByLoggedInUser={isWatchedByLoggedInUser}
                onWatch={this.handleWatch}
            />
        );
    }

    private handleWatch(on: boolean): void {
        this.setState({ isWatchedByLoggedInUser: on });
    }
}
