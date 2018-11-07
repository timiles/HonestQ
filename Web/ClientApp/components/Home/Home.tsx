import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Modal from '../shared/Modal';
import TopicsList from '../Topics/List';
import Intro from './Intro';

type HomeProps = RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel };

interface State {
    isIntroModalOpen: boolean;
}

class Home extends React.Component<HomeProps, State> {

    constructor(props: HomeProps) {
        super(props);

        this.state = { isIntroModalOpen: false };

        this.handleOpenIntro = this.handleOpenIntro.bind(this);
        this.handleCloseIntro = this.handleCloseIntro.bind(this);
    }

    public render() {
        const { isIntroModalOpen } = this.state;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {!this.props.loggedInUser &&
                    <div className="row">
                        <div className="col-md-12">
                            <div className="alert alert-success mt-3" role="alert">
                                <b>Welcome to HonestQ!</b> If you're new here, we suggest that you start by reading {}
                                <button
                                    type="button"
                                    className="btn btn-link btn-link-inline"
                                    onClick={this.handleOpenIntro}
                                >
                                    a quick intro
                                </button>.
                            </div>
                            <Modal
                                title="What is HonestQ?"
                                isOpen={isIntroModalOpen}
                                onRequestClose={this.handleCloseIntro}
                            >
                                <div className="modal-body"><Intro /></div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={this.handleCloseIntro}
                                    >
                                        Got it!
                                    </button>
                                </div>
                            </Modal>
                        </div>
                    </div>
                }
                <div className="row">
                    <div className="col-md-12">
                        <TopicsList />
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }

    private handleOpenIntro() {
        this.setState({ isIntroModalOpen: true });
    }

    private handleCloseIntro() {
        this.setState({ isIntroModalOpen: false });
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({ loggedInUser: state.login.loggedInUser }),
    {},
)(Home);
