import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import AdminHome from './components/Admin/AdminHome';
import EditAnswer from './components/Admin/EditAnswer';
import EditQuestion from './components/Admin/EditQuestion';
import EditTag from './components/Admin/EditTag';
import { Layout } from './components/Layout';
import NewTag from './components/Tag/NewTag';
import LogIn from './screens/Account/LogIn';
import LogOut from './screens/Account/LogOut';
import SignUp from './screens/Account/SignUp';
import VerifyEmail from './screens/Account/VerifyEmail';
import ThrowError from './screens/Admin/ThrowError';
import Home from './screens/Home';
import Notifications from './screens/Notifications';
import Questions from './screens/Questions';
import Question from './screens/Questions/Item';
import Tags from './screens/Tags';
import Tag from './screens/Tags/Item';

export const routes = (
    <Layout>
        <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route exact={true} path="/admin" component={AdminHome} />
            <Route exact={true} path="/admin/throwerror" component={ThrowError} />
            <Route exact={true} path="/admin/edit/questions/:questionId" component={EditQuestion} />
            <Route exact={true} path="/admin/edit/questions/:questionId/answers/:answerId" component={EditAnswer} />
            <Route exact={true} path="/admin/edit/tags/:tagSlug" component={EditTag} />
            <Route exact={true} path="/notifications" component={Notifications} />
            <Route exact={true} path="/questions" component={Questions} />
            <Route path="/login" component={LogIn} />
            <Route path="/account/verifyemail" component={VerifyEmail} />
            <Route path="/logout" component={LogOut} />
            <Route path="/signup" component={SignUp} />
            <Route path="/questions/:questionId/:questionSlug/:answerId?/:answerSlug?" component={Question} />
            <Route exact={true} path="/tags" component={Tags} />
            <Route path="/tags/_" component={NewTag} />
            <Route path="/tags/:tagSlug" component={Tag} />
        </Switch>
    </Layout>
);
