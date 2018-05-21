import * as React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { LoggedInModel } from '../server-models/LoggedInModel';
import { ApplicationState } from '../store';

// tslint:disable-next-line:interface-name
interface NavMenuProps {
    loggedInUser: LoggedInModel;
}

class NavMenu extends React.Component<NavMenuProps, {}> {
    public render() {
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
                        {this.props.loggedInUser && (
                            <span className="navbar-text">
                                Hi, {this.props.loggedInUser.firstName} ({this.props.loggedInUser.username})!
                            </span>
                        )}
                        <ul className="nav navbar-nav">
                            <li>
                                <NavLink exact={true} to={'/'} activeClassName="active">
                                    <span className="glyphicon glyphicon-home" /> Home
                                </NavLink>
                            </li>
                            {!this.props.loggedInUser && (
                                <li>
                                    <NavLink to={'/login'} activeClassName="active">
                                        <span className="glyphicon glyphicon-log-in" /> Login
                                </NavLink>
                                </li>
                            )}
                            {!this.props.loggedInUser && (
                                <li>
                                    <NavLink to={'/register'} activeClassName="active">
                                        <span className="glyphicon glyphicon-user" /> Register
                                </NavLink>
                                </li>
                            )}
                            {this.props.loggedInUser && (
                                <li>
                                    <NavLink to={'/logout'} activeClassName="active">
                                        <span className="glyphicon glyphicon-log-out" /> Log out
                                </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => ({ loggedInUser: state.login.loggedInUser }),
    {},
    null,
    // REVIEW: mark this component as not pure, so that activeClassName updates every time the parent element renders.
    // Note that this is not best for performance, but nav isn't going to stay like this forever anyway...
    { pure: false },
)(NavMenu);
