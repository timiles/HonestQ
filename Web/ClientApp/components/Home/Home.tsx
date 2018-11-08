import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { LoggedInUserContext } from '../LoggedInUserContext';
import TopicsList from '../Topics/List';
import Intro from './Intro';

type HomeProps = RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel };

class Home extends React.Component<HomeProps> {

    public render() {
        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {!this.props.loggedInUser &&
                    <div className="jumbotron">
                        <div className="row align-items-center">
                            <div className="col-md-9">
                                <h1>Welcome to HonestQ!</h1>
                                <Intro />
                                <p className="text-center">
                                    <Link className="btn btn-primary" to="/signup">
                                        Sign up for a free account now!
                                    </Link>
                                </p>
                            </div>
                            <div className="col-md-3 order-md-first text-center">
                                <img
                                    className="img-fluid"
                                    src="/android-chrome-256x256.png"
                                    alt="The HonestQ logo: a smiley face emoji with a halo shaped like a Q."
                                />
                            </div>
                        </div>
                    </div>
                }
                <div className="row">
                    <div className="col-md-12">
                        <TopicsList buttonSize="md" showNewTopicButton={true} />
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({ loggedInUser: state.login.loggedInUser }),
    {},
)(Home);
