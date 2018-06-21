import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, TopicListItemModel } from '../server-models';
import { ApplicationState } from '../store';
import * as HomeStore from '../store/Home';

type HomeProps = HomeStore.HomeState
    & typeof HomeStore.actionCreators
    & RouteComponentProps<{}>
    // PRIVATE BETA
    & { loggedInUser: LoggedInUserModel };

class Home extends React.Component<HomeProps, {}> {

    public componentWillMount() {
        // PRIVATE BETA
        if (!this.props.loggedInUser) {
            return;
        }
        if (!this.props.topicsList) {
            this.props.getTopicsList();
        }
    }

    public render() {
        const { topicsList } = this.props;
        return (
            <div className="col-md-12">
                <h1>POBS!</h1>
                <ul className="topics-list list-unstyled">
                    {topicsList &&
                        topicsList.topics.map((x: TopicListItemModel, i: number) =>
                            <li key={`topic${i}`}>
                                <Link to={`/${x.slug}`} className="btn btn-lg btn-outline-secondary">{x.name}</Link>
                            </li>)
                    }
                    <li>
                        <Link to="/newtopic" className="btn btn-lg btn-primary">
                            Suggest a new Topic
                        </Link>
                    </li>
                </ul>
            </div>
        );
    }
}

export default connect(
    // PRIVATE BETA: was just ` => (state.home)`
    (state: ApplicationState, ownProps: any) => ({ ...state.home, loggedInUser: state.login.loggedInUser }),
    HomeStore.actionCreators,
)(Home);
