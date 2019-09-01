import React from 'react';

export default class WelcomeMessage extends React.Component {

  public render() {
    return (
      <div className="row align-items-center">
        <div className="col-md-12 text-center welcome-message">
          <h1 className="mb-4">
            <span className="step-out-of-your">Step out of your</span>
            <br />
            <span className="echo-chamber">echo chamber</span>
          </h1>
          <p className="lead mb-0">
            <b>
              HonestQ is a Q&amp;A site based on freedom of speech, critical {}
              <br className="d-none d-md-block" />
              thinking, and citing your sources. Find out how people {}
              <br className="d-none d-md-block" />
              can disagree, honestly.
            </b>
          </p>
        </div>
      </div>
    );
  }
}
