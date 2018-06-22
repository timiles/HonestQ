import * as React from 'react';

export interface LoadingProps<T> {
    id?: string;
    loading?: boolean;
    model?: T;
    error?: string;
}

export default class Loading extends React.Component<LoadingProps<any>, {}> {
    public render() {
        const { loading, error, model } = this.props;
        return (
            <>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
            </>
        );
    }
}
