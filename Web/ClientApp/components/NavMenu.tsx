import * as React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, NavLinkProps } from 'react-router-dom';
import { LoggedInUserModel } from '../server-models';
import { ApplicationState } from '../store';
import { isUserInRole } from '../utils';

interface NavMenuProps {
    loggedInUser: LoggedInUserModel;
}

class NavMenu extends React.Component<NavMenuProps, {}> {
    public render() {

        const AutoCollapseNavLink = class extends React.Component<NavLinkProps, {}> {
            public render() {
                return (
                    <li data-toggle="collapse" data-target=".navbar-collapse.show">
                        <NavLink {...this.props}>
                            {this.props.children}
                        </NavLink>
                    </li>
                );
            }
        };

        const isAuthenticated = !!this.props.loggedInUser;
        const isAdmin = isUserInRole(this.props.loggedInUser, 'Admin');
        return (
            <div className="main-nav">
                <div className="navbar navbar-inverse">
                    <div className="navbar-header">
                        <button
                            type="button"
                            className="navbar-toggle"
                            data-toggle="collapse"
                            data-target=".navbar-collapse"
                        >
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                        </button>
                        <Link className="navbar-brand" to={'/'}>Pobs</Link>
                    </div>
                    <div className="clearfix" />
                    <div className="navbar-collapse collapse">
                        {isAuthenticated && (
                            <span className="navbar-text">
                                Hi, {this.props.loggedInUser.firstName} ({this.props.loggedInUser.username})!
                            </span>
                        )}
                        <ul className="nav navbar-nav">
                            <AutoCollapseNavLink exact={true} to={'/'} activeClassName="active">
                                <span className="glyphicon glyphicon-home" /> Home
                                </AutoCollapseNavLink>
                            {isAdmin && (
                                <AutoCollapseNavLink to={'/admin'} activeClassName="active">
                                    <span className="glyphicon glyphicon-flash" /> Admin
                                    </AutoCollapseNavLink>
                            )}
                            {!isAuthenticated && (
                                <AutoCollapseNavLink to={'/login'} activeClassName="active">
                                    <span className="glyphicon glyphicon-log-in" /> Login
                                    </AutoCollapseNavLink>
                            )}
                            {// PRIVATE BETA: was `!isAuthenticated && (`
                                isAdmin && (
                                    <AutoCollapseNavLink to={'/register'} activeClassName="active">
                                        <span className="glyphicon glyphicon-user" /> Register
                                        </AutoCollapseNavLink>
                                )}
                            {isAuthenticated && (
                                <AutoCollapseNavLink to={'/logout'} activeClassName="active">
                                    <span className="glyphicon glyphicon-log-out" /> Log out
                                    </AutoCollapseNavLink>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ loggedInUser: state.login.loggedInUser }),
    {},
    null,
    // REVIEW: mark this component as not pure, so that activeClassName updates every time the parent element renders.
    // Note that this is not best for performance, but nav isn't going to stay like this forever anyway...
    { pure: false },
)(NavMenu);
