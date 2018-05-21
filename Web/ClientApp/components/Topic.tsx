import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as TopicStore from '../store/Topic';

type TopicProps = TopicStore.TopicState
    & typeof TopicStore.actionCreators
    & RouteComponentProps<{}>;

// tslint:disable-next-line:interface-name
interface TopicRouteParams {
    topic: string;
}

class Topic extends React.Component<TopicProps> {

    public componentWillMount() {
        const routeParams = this.props.match.params as TopicRouteParams;
        if (this.props.urlFragment !== routeParams.topic) {
            this.props.getTopic(routeParams.topic);
        }
    }

    public render() {
        const { loading, error, topic } = this.props;
        return (
            <div>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {topic && (
                    <h1>{topic.name}</h1>
                )}
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.topic,
    TopicStore.actionCreators,
)(Topic) as typeof Topic;
