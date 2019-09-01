import React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as ToastStore from '../store/Toast';

type ToastProps = ToastStore.ToastState
  & typeof ToastStore.actionCreators;

class Toasts extends React.Component<ToastProps> {

  public componentDidUpdate(prevProps: ToastProps) {
    // If we just added a Toast, queue up for clearing it too
    if (this.props.toasts.length > prevProps.toasts.length) {
      this.props.clearToast(3000);
    }
  }

  public render() {
    const { toasts } = this.props;
    const mostRecentToast = toasts[toasts.length - 1];
    return (
      <div aria-live="polite" aria-atomic="true" id="toastsContainer">
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          {mostRecentToast &&
            // Use Toast content as a key so new Toasts will animate in
            <div
              key={mostRecentToast.title + mostRecentToast.message}
              className="toast show"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="toast-header">
                <strong className="mr-auto">✅ {mostRecentToast.title}</strong>
              </div>
              <div className="toast-body">
                {mostRecentToast.message}
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default connect(
  (state: ApplicationState, ownProps: any) => (state.toast),
  ToastStore.actionCreators,
)(Toasts);
