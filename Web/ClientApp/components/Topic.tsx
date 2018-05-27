import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { StatementFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as TopicStore from '../store/Topic';
import StatementForm from './Topic/StatementForm';
import Topic from './Topic/Topic';

type ContainerProps = TopicStore.ContainerState
    & typeof TopicStore.actionCreators
    & RouteComponentProps<{ topicUrlFragment: string }>;

class Container extends React.Component<ContainerProps, {}> {

    constructor(props: ContainerProps) {
        super(props);
    }

    public componentWillMount() {
        if (this.props.currentUrlFragment !== this.props.match.params.topicUrlFragment) {
            this.props.getTopic(this.props.match.params.topicUrlFragment);
        }
    }

    public render() {
        const { topic, statementForm, currentUrlFragment } = this.props;
        if (!statementForm.submit) {
            // REVIEW: Is there a better place to do this?
            statementForm.submit =
                (form: StatementFormModel) => this.props.submitStatement(this.props.currentUrlFragment!, form);
        }
        return (
            <div>
                <Topic {...topic}>
                    <StatementForm {...statementForm} />
                </Topic>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.topic),
    TopicStore.actionCreators,
)(Container);
