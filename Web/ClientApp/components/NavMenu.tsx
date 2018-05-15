import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';

export class NavMenu extends React.Component<{}, {}> {
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
                        <ul className="nav navbar-nav">
                            <li>
                                <NavLink exact to={'/'} activeClassName="active">
                                    <span className="glyphicon glyphicon-home" /> Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={'/login'} activeClassName="active">
                                    <span className="glyphicon glyphicon-log-in" /> Login
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={'/register'} activeClassName="active">
                                    <span className="glyphicon glyphicon-user" /> Register
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
