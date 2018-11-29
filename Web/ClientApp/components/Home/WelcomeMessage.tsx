import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';

export default class WelcomeMessage extends React.Component {

    public render() {
        return (
            <div className="jumbotron">
                <div className="row align-items-center">
                    <div className="col-md-9">
                        <h1>Welcome to HonestQ!</h1>
                        <p>
                            HonestQ is a <b>Q&amp;A site</b> for questions which may not have a simple answer.
                        </p>
                        <p>
                            This might be because the question is philosophical or subjective in nature;
                            maybe there are many possible answers; maybe more research is needed;
                            or perhaps the answers are hotly contested &ndash; they can't all be right... right?
                        </p>
                        <p>
                            HonestQ strongly encourages linking to <b>sources</b>,
                            and using <b>science</b>, <b>statistics</b>,
                            and an understanding of the human condition to challenge received wisdom.
                        </p>
                        <p>
                            We believe it can be healthy to embrace conflict, to step out of your comfort zone,
                            and to <b>listen to diverse opinions outside of your echo chamber</b> &ndash;
                            even if it's just so that you can argue against them more effectively.
                            Or who knows, you may even end up with a new point of view yourself.
                        </p>
                        <p>
                            Happy debating!
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
