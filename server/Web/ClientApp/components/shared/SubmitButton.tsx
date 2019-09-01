import React from 'react';

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
        {submitting &&
          <span
            className="spinner-border spinner-border-sm ml-2"
            role="status"
            aria-hidden="true"
          />
        }
      </button>
    );
  }
}
