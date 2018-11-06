import * as React from 'react';
import Helmet from 'react-helmet';
import * as ReactModal from 'react-modal';
// Import prototypes globally so they're available in every component
import '../prototypes';
import NavMenu from './NavMenu';

ReactModal.setAppElement('#react-app');

export class Layout extends React.Component<{}, {}> {
    public render() {
        const description = 'No trolling or outrage, just honest questions and debate.';
        return (
            <>
                <Helmet>
                    <title>HonestQ</title>
                    <meta name="title" content="HonestQ" />
                    <meta name="description" content={description} />
                    <meta property="og:title" content="HonestQ" />
                    <meta property="og:description" content={description} />
                    <meta property="og:image" content="https://www.honestq.com/android-chrome-256x256.png" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:site" content="@HonestQ_com" />
                </Helmet>
                <NavMenu />
                <div className="container">
                    {this.props.children}
                </div>
            </>
        );
    }
}
