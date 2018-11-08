import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { TopicListItemModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicsStore from '../../store/Topics';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Loading from '../shared/Loading';

type TopicsListProps = TopicsStore.ListState
    & typeof TopicsStore.actionCreators
    & { buttonSize?: string, selectedTopicSlugs?: string[], showNewTopicButton?: boolean };

class TopicsList extends React.Component<TopicsListProps> {

    public componentWillMount() {
        if (!this.props.loadingTopicsList.loadedModel) {
            this.props.getTopicsList();
        }
    }

    public render() {
        const topicsModel = this.props.loadingTopicsList.loadedModel;
        const { buttonSize = 'sm', selectedTopicSlugs = [], showNewTopicButton = false } = this.props;

        return (
            <>
                <h2>Topics</h2>
                <Loading {...this.props.loadingTopicsList} />
                {topicsModel &&
                    <ul className="list-inline">
                        {topicsModel.topics
                            .sort((a, b) => (a.slug.localeCompare(b.slug)))
                            .map((x: TopicListItemModel, i: number) =>
                                <li key={i} className="mr-1 mb-1 list-inline-item">
                                    <Link
                                        to={`/topics/${x.slug}`}
                                        className={`btn btn-${buttonSize} btn-outline-secondary ` +
                                            `${selectedTopicSlugs.indexOf(x.slug) >= 0 ? 'active' : ''}`}
                                    >
                                        {x.name}
                                    </Link>
                                </li>)}
                        {showNewTopicButton &&
                            <LoggedInUserContext.Consumer>
                                {(user) => user &&
                                    <li className="list-inline-item">
                                        <Link to="/newtopic" className={`btn btn-${buttonSize} btn-primary`}>
                                            Suggest a new Topic
                                        </Link>
                                    </li>}
                            </LoggedInUserContext.Consumer>}
                    </ul>
                }
            </>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => (state.topics),
    TopicsStore.actionCreators,
)(TopicsList);
