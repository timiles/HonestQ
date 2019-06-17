import React from 'react';
import Helmet from 'react-helmet';
import ReactModal from 'react-modal';
// Import prototypes globally so they're available in every component
import '../prototypes';
import NavBar from './NavBar';
import Toasts from './Toasts';

ReactModal.setAppElement('#react-app');

export class Layout extends React.Component<{}, {}> {

    // tslint:disable:max-line-length
    public render() {
        return (
            <>
                <Helmet>
                    <title>HonestQ</title>
                    <meta name="title" content="HonestQ" />
                    <meta name="description" content="HonestQ is a Q&amp;A site based on freedom of speech, critical thinking, and citing your sources. Step out of your echo chamber." />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="Step out of your echo chamber." />
                    <meta property="og:description" content="𝗛𝗼𝗻𝗲𝘀𝘁𝗤 is a Q&amp;A site based on freedom of speech, critical thinking, and citing your sources." />
                    <meta property="og:image" content="https://www.honestq.com/android-chrome-256x256.png" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:site" content="@HonestQ_com" />
                </Helmet>
                <NavBar />
                <Toasts />
                {this.props.children}
            </>
        );
    }
}
