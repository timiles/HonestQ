import * as React from 'react';
import * as ReactModal from 'react-modal';

interface Props {
    title: string;
    isOpen: boolean;
    onRequestClose: () => void;
}

export default class Modal extends React.Component<Props, {}> {

    public render() {
        const { title, isOpen, onRequestClose } = this.props;

        return (
            <ReactModal
                className="Modal__Bootstrap modal-dialog"
                closeTimeoutMS={150}
                isOpen={isOpen}
                onRequestClose={onRequestClose}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{title}</h4>
                        <button type="button" className="close" onClick={onRequestClose}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                    {this.props.children}
                </div>
            </ReactModal>
        );
    }
}
