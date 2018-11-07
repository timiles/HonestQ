import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, TopicListItemModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as HomeStore from '../../store/Home';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Loading from '../shared/Loading';
import Modal from '../shared/Modal';
import Intro from './Intro';

type HomeProps = HomeStore.HomeState
    & typeof HomeStore.actionCreators
    & RouteComponentProps<{}>
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

    public componentWillMount() {
        if (!this.props.loadingTopicsList.loadedModel) {
            this.props.getTopicsList();
        }
    }

    public render() {
        const topicsModel = this.props.loadingTopicsList.loadedModel;
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
                        <h2>Topics</h2>
                        <Loading {...this.props.loadingTopicsList} />
                        {topicsModel &&
                            <ul className="list-inline">
                                {topicsModel.topics.map((x: TopicListItemModel, i: number) =>
                                    <li key={i} className="mr-1 mb-1 list-inline-item">
                                        <Link
                                            to={`/topics/${x.slug}`}
                                            className="btn btn-sm btn-outline-secondary topic-list-item"
                                        >
                                            {x.name}
                                        </Link>
                                    </li>)}
                                <LoggedInUserContext.Consumer>
                                    {(user) => isUserInRole(user, 'Admin') &&
                                        <li className="list-inline-item">
                                            <Link to="/newtopic" className="btn btn-sm btn-primary">
                                                Suggest a new Topic
                                        </Link>
                                        </li>}
                                </LoggedInUserContext.Consumer>
                            </ul>
                        }
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
    (state: ApplicationState, ownProps: any): any => ({ ...state.home, loggedInUser: state.login.loggedInUser }),
    HomeStore.actionCreators,
)(Home);
