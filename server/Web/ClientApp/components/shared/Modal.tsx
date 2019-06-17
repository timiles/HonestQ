import React from 'react';
import * as ReactGA from 'react-ga';
import ReactModal from 'react-modal';

interface Props {
    title: string;
    isOpen: boolean;
    onRequestClose: () => void;
}

export default class Modal extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handleAfterOpen = this.handleAfterOpen.bind(this);
    }

    public render() {
        const { title, isOpen, onRequestClose } = this.props;

        return (
            <ReactModal
                className="Modal__Bootstrap modal-dialog"
                closeTimeoutMS={150}
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                onAfterOpen={this.handleAfterOpen}
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

    private handleAfterOpen() {
        const { title } = this.props;
        ReactGA.event({
            category: 'User',
            action: `Modal: ${title}`,
        });
    }
}
