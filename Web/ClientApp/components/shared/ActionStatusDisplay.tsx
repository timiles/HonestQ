import * as React from 'react';
import { ActionStatus } from '../../store/ActionStatuses';

export default class ActionStatusDisplay extends React.Component<ActionStatus> {
    public render() {
        const { loading, error } = this.props;

        return (
            <>
                {loading && <p>⏳ <i>Loading...</i></p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
            </>
        );
    }
}
