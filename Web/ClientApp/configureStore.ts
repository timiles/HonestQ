import { History } from 'history';
import { routerMiddleware, routerReducer } from 'react-router-redux';
// tslint:disable-next-line:max-line-length
import { GenericStoreEnhancer, ReducersMapObject, Store, StoreEnhancerStoreCreator, applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import * as StoreModule from './store';

export default function configureStore(history: History, initialState?: StoreModule.ApplicationState) {
    // Build middleware. These are functions that can process the actions before they reach the store.
    const windowIfDefined = typeof window === 'undefined' ? null : window as any;
    // If devTools is installed, connect to it
    const devToolsExtension =
        windowIfDefined && windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__ as () => GenericStoreEnhancer;
    const createStoreWithMiddleware = compose(
        applyMiddleware(thunk, routerMiddleware(history)),
        devToolsExtension ? devToolsExtension() : <S>(next: StoreEnhancerStoreCreator<S>) => next,
    )(createStore);

    // Combine all reducers and instantiate the app-wide store instance
    const allReducers = buildRootReducer(StoreModule.reducers);
    const store = createStoreWithMiddleware(allReducers, initialState) as Store<StoreModule.ApplicationState>;

    // Enable Webpack hot module replacement for reducers
    if (module.hot) {
        module.hot.accept('./store', () => {
            const nextRootReducer = require<typeof StoreModule>('./store');
            store.replaceReducer(buildRootReducer(nextRootReducer.reducers));
        });
    }

    return store;
}

function buildRootReducer(allReducers: ReducersMapObject) {
    // tslint:disable-next-line
    return combineReducers<StoreModule.ApplicationState>(Object.assign({}, allReducers, { routing: routerReducer }));
}
