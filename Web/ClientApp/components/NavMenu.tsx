import * as React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, NavLinkProps } from 'react-router-dom';
import { LoggedInUserModel } from '../server-models';
import { ApplicationState } from '../store';
import { isUserInRole } from '../utils/auth-utils';
import NotificationsCount from './Notifications/NotificationsCount';

interface NavMenuProps {
    loggedInUser: LoggedInUserModel;
}

class NavMenu extends React.Component<NavMenuProps, {}> {
    public render() {

        const AutoCollapseNavLink = class extends React.Component<NavLinkProps, {}> {
            public render() {
                return (
                    <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                        <NavLink {...this.props} className="nav-link" activeClassName="active">
                            {this.props.children}
                        </NavLink>
                    </li>
                );
            }
        };

        const { loggedInUser } = this.props;
        const greeting = loggedInUser ? (
            <span className="navbar-text">
                Hi, {loggedInUser.username}!
            </span>
        ) : null;
        const isAdmin = isUserInRole(loggedInUser, 'Admin');

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
                <div className="container">
                    <Link className="navbar-brand" to={'/'}>
                        HonestQ <small><sup className="badge badge-info">BETA</sup></small>
                    </Link>
                    {loggedInUser &&
                        <div className="ml-auto mr-2 d-lg-none">
                            <Link to="/notifications" className="no-underline">
                                🔔 <NotificationsCount />
                            </Link>
                        </div>
                    }
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            {greeting &&
                                <li className="d-block d-lg-none">
                                    {greeting}
                                </li>
                            }
                            <AutoCollapseNavLink exact={true} to={'/'}>Home</AutoCollapseNavLink>
                            <AutoCollapseNavLink exact={true} to={'/questions'}>Questions</AutoCollapseNavLink>
                            {loggedInUser &&
                                <AutoCollapseNavLink exact={true} to={'/notifications'}>
                                    Notifications <NotificationsCount />
                                </AutoCollapseNavLink>
                            }
                            {isAdmin && <AutoCollapseNavLink to={'/admin'}>Admin</AutoCollapseNavLink>}
                        </ul>
                        <ul className="navbar-nav ml-auto">
                            {greeting &&
                                <>
                                    <li className="d-none d-lg-block">
                                        {greeting}
                                    </li>
                                    <AutoCollapseNavLink to={'/logout'}>Log out</AutoCollapseNavLink>
                                </>
                                ||
                                <>
                                    <AutoCollapseNavLink to={'/login'}>Log in</AutoCollapseNavLink>
                                    <AutoCollapseNavLink to={'/signup'}><b>Sign up</b></AutoCollapseNavLink>
                                </>}
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({ loggedInUser: state.login.loggedInUser }),
    {},
    null,
    // REVIEW: mark this component as not pure, so that activeClassName updates every time the parent element renders.
    // Note that this is not best for performance, but nav isn't going to stay like this forever anyway...
    { pure: false },
)(NavMenu);
