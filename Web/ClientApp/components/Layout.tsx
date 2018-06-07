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
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-3">
                            <NavMenu />
                        </div>
                        <div className="col-sm-9">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
