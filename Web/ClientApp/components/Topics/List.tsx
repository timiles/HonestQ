import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { TopicListItemModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicsStore from '../../store/Topics';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Loading from '../shared/Loading';

type TopicsListProps = TopicsStore.ListState
    & typeof TopicsStore.actionCreators;

class TopicsList extends React.Component<TopicsListProps> {

    public componentWillMount() {
        if (!this.props.loadingTopicsList.loadedModel) {
            this.props.getTopicsList();
        }
    }

    public render() {
        const topicsModel = this.props.loadingTopicsList.loadedModel;

        return (
            <>
                <h2>Topics</h2>
                <Loading {...this.props.loadingTopicsList} />
                {topicsModel &&
                    <ul className="list-inline">
                        {topicsModel.topics.map((x: TopicListItemModel, i: number) =>
                            <li key={i} className="mr-1 mb-1 list-inline-item">
                                <Link
                                    to={`/topics/${x.slug}`}
                                    className="btn btn-sm btn-outline-secondary topic-list-item"
                                >
                                    {x.name}
                                </Link>
                            </li>)}
                        <LoggedInUserContext.Consumer>
                            {(user) => isUserInRole(user, 'Admin') &&
                                <li className="list-inline-item">
                                    <Link to="/newtopic" className="btn btn-sm btn-primary">
                                        Suggest a new Topic
                                    </Link>
                                </li>}
                        </LoggedInUserContext.Consumer>
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
