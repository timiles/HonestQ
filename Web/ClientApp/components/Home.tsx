import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { TopicListItemModel } from '../server-models';
import { ApplicationState } from '../store';
import * as HomeStore from '../store/Home';

type HomeProps = HomeStore.HomeState
    & typeof HomeStore.actionCreators
    & RouteComponentProps<{}>;

class Home extends React.Component<HomeProps, {}> {

    public componentWillMount() {
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
    (state: ApplicationState, ownProps: any) => (state.home),
    HomeStore.actionCreators,
)(Home);
