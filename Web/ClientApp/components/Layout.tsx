import * as React from 'react';
import Helmet from 'react-helmet';
import * as ReactModal from 'react-modal';
// Import prototypes globally so they're available in every component
import '../prototypes';
import NavMenu from './NavMenu';

ReactModal.setAppElement('#react-app');

export class Layout extends React.Component<{}, {}> {
    public render() {
        return (
            <>
                <Helmet>
                    <title>HonestQ</title>
                    <meta name="title" content="HonestQ" />
                    <meta name="description" content="No trolling or outrage, just honest questions and debate" />
                </Helmet>
                <NavMenu />
                <div className="container">
                    {this.props.children}
                </div>
            </>
        );
    }
}
