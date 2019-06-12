import React from 'react';
import { ActionStatus } from '../../store/ActionStatuses';

export default class ActionStatusDisplay extends React.Component<ActionStatus> {
    public render() {
        const { loading, error } = this.props;

        return (
            <>
                {loading &&
                    <div className="loading-spinner-container text-center">
                        <div className="loading-spinner spinner-border mt-3" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                }
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
            </>
        );
    }
}
