import * as React from 'react';
import { Route } from 'react-router-dom';
import Home from './components/Home';
import { Layout } from './components/Layout';
import Register from './components/Register';

export const routes = (
    <Layout>
        <Route exact path="/" component={Home} />
        <Route path="/register" component={Register} />
    </Layout>
);
