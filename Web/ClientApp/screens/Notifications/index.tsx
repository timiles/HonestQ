import { EventEmitter } from 'events';
import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import NotificationList from '../../components/Notifications/List';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';

interface Props { loggedInUser: LoggedInUserModel; }

class Index extends React.Component<Props> {

    private windowScrollEventEmitter: EventEmitter = new EventEmitter();

    constructor(props: Props) {
        super(props);

        this.handleScroll = this.handleScroll.bind(this);
    }

    public componentDidMount() {
        window.scrollTo(0, 0);
        window.addEventListener('scroll', this.handleScroll);
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    public render() {
        if (!this.props.loggedInUser) {
            return <Redirect to="/login" />;
        }

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 col-lg-6 offset-lg-3">
                            <NotificationList
                                windowScrollEventEmitter={this.windowScrollEventEmitter}
                                onAllNotificationsLoaded={this.onAllNotificationsLoaded}
                            />
                        </div>
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }

    private handleScroll(event: Event) {
        if (!document.documentElement) {
            return;
        }

        // Tested in Chrome, Edge, Firefox
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop; // Fallback for Edge
        const clientHeight = document.documentElement.clientHeight;

        // Trigger 100px before we hit the bottom - this also helps mobile Chrome, which seems to be ~60px short??
        if (scrollHeight - scrollTop - clientHeight < 100) {
            this.windowScrollEventEmitter.emit('scrolledToBottom');
        }
    }

    private onAllNotificationsLoaded() {
        window.removeEventListener('scroll', this.handleScroll);
    }
}

export default connect((state: ApplicationState, ownProps: any): any => (state.login))(Index);
