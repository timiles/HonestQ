import * as React from 'react';
import { Route } from 'react-router-dom';
import Home from './components/Home';
import { Layout } from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';

export const routes = (
    <Layout>
        <Route exact={true} path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
    </Layout>
);
