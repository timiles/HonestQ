import { RenderResult, createServerRenderer } from 'aspnet-prerendering';
import { createMemoryHistory } from 'history';
import * as React from 'react';
// tslint:disable-next-line:no-submodule-imports
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { replace } from 'react-router-redux';
import configureStore from './configureStore';
import { routes } from './routes';
import { ApplicationState } from './store';

export default createServerRenderer((params) => {
    return new Promise<RenderResult>((resolve, reject) => {
        // Prepare Redux store with in-memory history, and dispatch a navigation event
        // corresponding to the incoming URL
        const basename = params.baseUrl.substring(0, params.baseUrl.length - 1); // Remove trailing slash
        const urlAfterBasename = params.url.substring(basename.length);
        const store = configureStore(createMemoryHistory());
        store.dispatch(replace(urlAfterBasename));

        if (params.data.login.loggedInUser) {
            store.dispatch({ type: 'LOGIN_SUCCESS', payload: params.data.login.loggedInUser });
        }

        // Prepare an instance of the application and perform an inital render that will
        // cause any async tasks (e.g., data access) to begin
        const routerContext: any = {};
        const app = (
            <Provider store={store}>
                <StaticRouter
                    basename={basename}
                    context={routerContext}
                    location={params.location.path}
                    children={routes}
                />
            </Provider>
        );
        renderToString(app);

        // If there's a redirection, just send this information back to the host application
        if (routerContext.url) {
            resolve({
                redirectUrl: routerContext.url,
                statusCode: routerContext.status,
            });
            return;
        }

        const embedlyScript = `
(function(w, d){
var id='embedly-platform', n = 'script';
if (!d.getElementById(id)){
    w.embedly = w.embedly || function() {(w.embedly.q = w.embedly.q || []).push(arguments);};
    var e = d.createElement(n); e.id = id; e.async=1;
    e.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://cdn.embedly.com/widgets/platform.js';
    var s = d.getElementsByTagName(n)[0];
    s.parentNode.insertBefore(e, s);
}
})(window, document);`;
        const fullHtml = (reactApp: React.ReactElement<any>, state: ApplicationState) => (
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Home - Web</title>
                    <base href="/" />

                    <link rel="stylesheet" href={params.data.versionedAssetPaths.vendorCss} />
                    <link rel="stylesheet" href={params.data.versionedAssetPaths.siteCss} />
                </head>
                <body>
                    <div id="react-app">{reactApp}</div>
                    <script
                        dangerouslySetInnerHTML={{ __html: `window.initialReduxState = ${JSON.stringify(state)}` }}
                    />
                    <script src={params.data.versionedAssetPaths.vendorJs} />
                    <script src={params.data.versionedAssetPaths.mainClientJs} />
                    <script dangerouslySetInnerHTML={{ __html: embedlyScript }} />
                </body>
            </html>
        );

        // Once any async tasks are done, we can perform the final render
        // We also send the redux store state, so the client can continue execution where the server left off
        params.domainTasks.then(() => {
            resolve({
                html: '<!DOCTYPE html>' + renderToString(fullHtml(app, store.getState())),
                statusCode: routerContext.status,
            });
        }, reject); // Also propagate any errors back into the host application
    });
});
