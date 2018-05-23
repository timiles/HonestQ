import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as TopicStore from '../store/Topic';

type TopicProps = TopicStore.TopicState
    & typeof TopicStore.actionCreators
    & RouteComponentProps<{ topicUrlFragment: string }>;

class Topic extends React.Component<TopicProps> {

    public componentWillMount() {
        if (this.props.urlFragment !== this.props.match.params.topicUrlFragment) {
            this.props.getTopic(this.props.match.params.topicUrlFragment);
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
    (state: ApplicationState, ownProps: any) => (state.topic),
    TopicStore.actionCreators,
)(Topic);
