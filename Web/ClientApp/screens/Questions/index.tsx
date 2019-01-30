import { EventEmitter } from 'events';
import * as React from 'react';
import { connect } from 'react-redux';
import QuestionList from '../../components/Questions/List';
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
        window.addEventListener('scroll', this.handleScroll);
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    public render() {
        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                <div className="row">
                    <div className="col-md-12 col-lg-6 offset-lg-3">
                        <QuestionList
                            windowScrollEventEmitter={this.windowScrollEventEmitter}
                            onAllQuestionsLoaded={this.onAllQuestionsLoaded}
                        />
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }

    private handleScroll(event: UIEvent) {
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

    private onAllQuestionsLoaded() {
        window.removeEventListener('scroll', this.handleScroll);
    }
}

export default connect((state: ApplicationState, ownProps: any): any => (state.login))(Index);
