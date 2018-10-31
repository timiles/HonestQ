import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import LogIn from './components/Account/LogIn';
import LogOut from './components/Account/LogOut';
import SignUp from './components/Account/SignUp';
import VerifyEmail from './components/Account/VerifyEmail';
import AdminHome from './components/Admin/AdminHome';
import EditAnswer from './components/Admin/EditAnswer';
import EditQuestion from './components/Admin/EditQuestion';
import EditTopic from './components/Admin/EditTopic';
import Home from './components/Home/Home';
import { Layout } from './components/Layout';
import Question from './components/Question/Container';
import Topic from './components/Topic/Container';
import NewTopic from './components/Topic/NewTopic';

export const routes = (
    <Layout>
        <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route exact={true} path="/admin" component={AdminHome} />
            <Route exact={true} path="/admin/edit/questions/:questionId" component={EditQuestion} />
            <Route exact={true} path="/admin/edit/questions/:questionId/answers/:answerId" component={EditAnswer} />
            <Route exact={true} path="/admin/edit/topics/:topicSlug" component={EditTopic} />
            <Route path="/login" component={LogIn} />
            <Route path="/account/verifyemail" component={VerifyEmail} />
            <Route path="/logout" component={LogOut} />
            <Route path="/newtopic" component={NewTopic} />
            <Route path="/signup" component={SignUp} />
            <Route path="/questions/:questionId/:questionSlug/:answerId?/:answerSlug?" component={Question} />
            <Route path="/topics/:topicSlug" component={Topic} />
        </Switch>
    </Layout>
);
