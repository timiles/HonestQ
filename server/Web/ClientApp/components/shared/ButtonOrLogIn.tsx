import React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import Modal from './Modal';

interface Props {
    className: string;
    onClick: (event: React.FormEvent<HTMLButtonElement>) => void;
    submitting?: boolean;
    type: string;
    value?: string | number | string[] | undefined;
}

interface State {
    isModalOpen: boolean;
}

export default class ButtonOrLogIn extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isModalOpen: false };

        this.openLogInModal = this.openLogInModal.bind(this);
        this.closeLogInModal = this.closeLogInModal.bind(this);
    }

    public render() {
        const { className, onClick, submitting, type, value } = this.props;
        const { isModalOpen } = this.state;

        return (
            <LoggedInUserContext.Consumer>
                {(user) => user &&
                    <button
                        type={type}
                        className={className}
                        onClick={onClick}
                        value={value}
                        disabled={submitting}
                    >
                        {this.props.children}
                    </button>
                    ||
                    <>
                        <button
                            type="button"
                            className={className}
                            onClick={this.openLogInModal}
                        >
                            {this.props.children}
                        </button>
                        <Modal title="Log in" isOpen={isModalOpen} onRequestClose={this.closeLogInModal}>
                            <div className="modal-body">
                                <p>Please log in or sign up to continue.</p>
                                <p>Setting up an account is free. Your voice deserves to be heard!</p>
                            </div>
                            <div className="modal-footer">
                                <Link to={'/login'} className="btn btn-primary">Log in</Link>
                                <Link to={'/signup'} className="btn btn-primary">Sign up</Link>
                            </div>
                        </Modal>
                    </>
                }
            </LoggedInUserContext.Consumer>
        );
    }

    private openLogInModal() {
        this.setState({ isModalOpen: true });
    }

    private closeLogInModal() {
        this.setState({ isModalOpen: false });
    }
}
