import * as React from 'react';
import Spinner from './Spinner';

interface SubmitButtonProps {
    submitting?: boolean;
    text?: string;
}

export default class SubmitButton extends React.Component<SubmitButtonProps, {}> {
    public render() {
        const { text, submitting } = this.props;
        return (
            <button className="btn btn-primary" disabled={submitting}>
                {text || 'Submit'}
                {submitting && <Spinner />}
            </button>
        );
    }
}
