import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import EditStatement from './components/Admin/EditStatement';
import EditTopic from './components/Admin/EditTopic';
import AdminHome from './components/AdminHome';
import Home from './components/Home';
import Intro from './components/Intro';
import { Layout } from './components/Layout';
import Login from './components/Login';
import Logout from './components/Logout';
import NewTopic from './components/NewTopic';
import Register from './components/Register';
import Topic from './components/Topic/Container';

export const routes = (
    <Layout>
        <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route exact={true} path="/admin" component={AdminHome} />
            <Route exact={true} path="/admin/edit/:topicSlug" component={EditTopic} />
            <Route exact={true} path="/admin/edit/:topicSlug/:statementId" component={EditStatement} />
            <Route path="/intro" component={Intro} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/newtopic" component={NewTopic} />
            <Route path="/register" component={Register} />
            <Route path="/:topicSlug/:statementId?/:statementSlug?" component={Topic} />
        </Switch>
    </Layout>
);
