import * as React from 'react';
import Helmet from 'react-helmet';
// Import prototypes globally so they're available in every component
import '../prototypes';
import NavMenu from './NavMenu';

export class Layout extends React.Component<{}, {}> {
    public render() {
        return (
            <>
                <Helmet>
                    <title>POBS</title>
                </Helmet>
                <NavMenu />
                <div className="container">
                    <div className="row">
                        {this.props.children}
                    </div>
                </div>
            </>
        );
    }
}
