import * as React from 'react';
import { Redirect, RedirectProps, Route, RouteComponentProps } from 'react-router';

type RedirectWithStatusCodeProps = RedirectProps & { statusCode: number };

export default class RedirectWithStatusCode extends React.Component<RedirectWithStatusCodeProps> {

    constructor(props: RedirectWithStatusCodeProps) {
        super(props);

        this.renderRoute = this.renderRoute.bind(this);
    }

    public render() {
        return <Route render={this.renderRoute} />;
    }

    private renderRoute(routeComponentProps: RouteComponentProps): JSX.Element {
        // `staticContext` only exists on Server Side Render
        if (routeComponentProps.staticContext) {
            routeComponentProps.staticContext.statusCode = this.props.statusCode;
        }
        return <Redirect {...this.props} />;
    }
}
