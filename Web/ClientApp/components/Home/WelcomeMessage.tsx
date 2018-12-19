import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';

export default class WelcomeMessage extends React.Component {

    public render() {
        return (
            <div className="jumbotron">
                <div className="row align-items-center">
                    <div className="col-md-9">
                        <h1 className="mb-4">Step out of your echo chamber.</h1>
                        <p className="lead">
                            <b>HonestQ</b> is a Q&amp;A site based on freedom of speech, critical thinking,
                            and citing your sources.
                        </p>
                        <p className="lead">
                            Find out how people can disagree, honestly.
                        </p>
                        <LoggedInUserContext.Consumer>
                            {(user) => !user &&
                                <p className="text-center">
                                    <Link className="btn btn-primary" to="/signup">
                                        Sign up for a free account now!
                                    </Link>
                                </p>
                            }
                        </LoggedInUserContext.Consumer>
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
        );
    }
}
