import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Admin from './components/Admin';
import Home from './components/Home';
import { Layout } from './components/Layout';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import Topic from './components/Topic/Container';

export const routes = (
    <Layout>
        <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route path="/admin" component={Admin} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/register" component={Register} />
            <Route path="/:topicSlug/:statementId?" component={Topic} />
        </Switch>
    </Layout>
);
