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
            <>
                <h1>POBS!</h1>
                {topicsList &&
                    topicsList.topics.map((x: TopicListItemModel, i: number) =>
                        <div key={`topic${i}`}>
                            <Link to={`/${x.slug}`}>{x.name}</Link>
                        </div>)
                }
            </>
        );
    }
}

export default connect(
    // PRIVATE BETA: was just ` => (state.home)`
    (state: ApplicationState, ownProps: any) => ({ ...state.home, loggedInUser: state.login.loggedInUser }),
    HomeStore.actionCreators,
)(Home);
