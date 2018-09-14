import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, PopListItemModel, TopicListItemModel } from '../server-models';
import { ApplicationState } from '../store';
import * as HomeStore from '../store/Home';
import Loading from './shared/Loading';
import PopTypeView from './shared/PopTypeView';
import NewPop from './Topic/NewPop';

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
        if (!this.props.loadingPopsList.loadedModel) {
            this.props.getPopsList();
        }
        if (!this.props.loadingTopicsList.loadedModel) {
            this.props.getTopicsList();
        }
    }

    public render() {
        const popsModel = this.props.loadingPopsList.loadedModel;
        const topicsModel = this.props.loadingTopicsList.loadedModel;
        return (
            <div className="col-md-12">
                <h1>Recent questions</h1>
                <Loading {...this.props.loadingPopsList} />
                {popsModel &&
                    <ul className="topics-list">
                        {popsModel.pops.map((x: PopListItemModel, i: number) =>
                            <li key={`pop_${i}`} className="mr-2 mb-2">
                                <Link
                                    to={`/pops/${x.id}/${x.slug}`}
                                    className="btn btn-lg btn-outline-secondary pop-list-item"
                                >
                                    <PopTypeView value={x.type} />
                                    <span className={`pop pop-${x.type.toLowerCase()}`}>{x.text}</span>
                                </Link>
                            </li>)}
                        <li>
                            <NewPop popType="Question" />
                        </li>
                    </ul>
                }
                <h2>Or browse by topic</h2>
                <Loading {...this.props.loadingTopicsList} />
                {topicsModel &&
                    <ul className="topics-list">
                        {topicsModel.topics.map((x: TopicListItemModel, i: number) =>
                            <li key={`topic${i}`} className="mr-1 mb-1">
                                <Link to={`/topics/${x.slug}`} className="btn btn-sm btn-outline-secondary">
                                    {x.name}
                                </Link>
                            </li>)}
                        <li>
                            <Link to="/newtopic" className="btn btn-sm btn-primary">
                                Suggest a new Topic
                            </Link>
                        </li>
                    </ul>
                }
            </div>
        );
    }
}

export default connect(
    // PRIVATE BETA: was just ` => (state.home)`
    (state: ApplicationState, ownProps: any) => ({ ...state.home, loggedInUser: state.login.loggedInUser }),
    HomeStore.actionCreators,
)(Home);
