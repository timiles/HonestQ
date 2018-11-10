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
import { Layout } from './components/Layout';
import Topic from './components/Topic/Container';
import NewTopic from './components/Topic/NewTopic';
import Home from './screens/Home';
import QuestionsList from './screens/Questions';
import Question from './screens/Questions/Item';

export const routes = (
    <Layout>
        <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route exact={true} path="/admin" component={AdminHome} />
            <Route exact={true} path="/admin/edit/questions/:questionId" component={EditQuestion} />
            <Route exact={true} path="/admin/edit/questions/:questionId/answers/:answerId" component={EditAnswer} />
            <Route exact={true} path="/admin/edit/topics/:topicSlug" component={EditTopic} />
            <Route exact={true} path="/questions" component={QuestionsList} />
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
