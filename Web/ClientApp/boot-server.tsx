import { createServerRenderer, RenderResult } from 'aspnet-prerendering';
import { createMemoryHistory } from 'history';
import * as React from 'react';
// tslint:disable-next-line:no-submodule-imports
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import Helmet, { HelmetData } from 'react-helmet';
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

        let userId;
        if (params.data.login.loggedInUser) {
            store.dispatch({ type: 'LOGIN_SUCCESS', payload: params.data.login.loggedInUser });
            userId = params.data.login.loggedInUser.id;
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
        // Always call renderStatic before returning, to avoid memory leak
        Helmet.renderStatic();

        // If there's a redirection, just send this information back to the host application
        if (routerContext.url) {
            resolve({
                redirectUrl: routerContext.url,
                statusCode: routerContext.statusCode,
            });
            return;
        }

        const trackingCode = params.data.googleAnalyticsTrackingCode;
        const gaScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${userId ? `gtag('set', { user_id: '${userId}' });
gtag('config', '${trackingCode}');
` : ''
            }`;

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

        const fullHtml = (helmetData: HelmetData, renderedApp: string, state: ApplicationState) => (
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    {helmetData.title.toComponent()}
                    {helmetData.link.toComponent()}
                    {helmetData.meta.toComponent()}
                    <base href="/" />

                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="manifest" href="/site.webmanifest" />
                    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                    <meta name="msapplication-TileColor" content="#da532c" />
                    <meta name="theme-color" content="#ffffff" />

                    <link rel="stylesheet" href={params.data.versionedAssetPaths.vendorCss} />
                    <link rel="stylesheet" href={params.data.versionedAssetPaths.siteCss} />
                </head>
                <body>
                    <div id="react-app" dangerouslySetInnerHTML={{ __html: renderedApp }} />
                    <script
                        dangerouslySetInnerHTML={{
                            // XSS: replace "<" to defend against "</script>" in the state data
                            __html: `window.initialReduxState = ${JSON.stringify(state).replace(/</g, '\\u003c')}`,
                        }}
                    />
                    <script src={params.data.versionedAssetPaths.vendorJs} />
                    <script src={params.data.versionedAssetPaths.mainClientJs} />
                    {trackingCode &&
                        <>
                            <script async={true} src={`https://www.googletagmanager.com/gtag/js?id=${trackingCode}`} />
                            <script dangerouslySetInnerHTML={{ __html: gaScript }} />
                        </>
                    }
                    <script dangerouslySetInnerHTML={{ __html: embedlyScript }} />
                </body>
            </html>
        );

        // Once any async tasks are done, we can perform the final render
        // We also send the redux store state, so the client can continue execution where the server left off
        params.domainTasks.then(() => {
            // Final render of the app
            const renderedApp = renderToString(app);

            // Check again for redirects
            if (routerContext.url) {
                resolve({
                    redirectUrl: routerContext.url,
                    statusCode: routerContext.statusCode,
                });
                return;
            }

            // ...and then collect head tags
            const helmetData = Helmet.renderStatic();
            resolve({
                html: '<!DOCTYPE html>' + renderToStaticMarkup(fullHtml(helmetData, renderedApp, store.getState())),
                statusCode: routerContext.status,
            });
        }, reject); // Also propagate any errors back into the host application
    });
});
