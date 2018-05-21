import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import { Layout } from './components/Layout';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import Topic from './components/Topic';

export const routes = (
    <Layout>
        <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/register" component={Register} />
            <Route path="/:topic" component={Topic} />
        </Switch>
    </Layout>
);
