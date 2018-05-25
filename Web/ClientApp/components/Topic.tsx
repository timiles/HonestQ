import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { StatementFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as TopicStore from '../store/Topic';
import SubmitButton from './shared/SubmitButton';

type TopicProps = TopicStore.TopicState
    & typeof TopicStore.actionCreators
    & RouteComponentProps<{ topicUrlFragment: string }>;

class Topic extends React.Component<TopicProps, StatementFormModel> {

    constructor(props: TopicProps) {
        super(props);

        this.state = { text: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillMount() {
        if (this.props.urlFragment !== this.props.match.params.topicUrlFragment) {
            this.props.getTopic(this.props.match.params.topicUrlFragment);
        }
    }

    public componentWillReceiveProps(nextProps: TopicProps) {
        // This will reset the form when a statement has been successfully submitted
        if (!nextProps.submittedStatement) {
            this.setState({ text: '' });
        }
    }

    public render() {
        const { loading, error, topic, urlFragment, submittingStatement, submittedStatement } = this.props;
        const { text } = this.state;
        return (
            <div>
                {loading && <p>Loading...</p>}
                {topic && (
                    <div>
                        <h1>{topic.name}</h1>
                        <div className="col-md-6">
                            <h2>Submit New Statement</h2>
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}
                            <form name="form" onSubmit={this.handleSubmit}>
                                <div className={'form-group' + (submittedStatement && !text ? ' has-error' : '')}>
                                    <label htmlFor="text">Statement</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="text"
                                        value={text}
                                        onChange={this.handleChange}
                                    />
                                    {submittedStatement && !text && <div className="help-block">Text is required</div>}
                                </div>
                                <div className="form-group">
                                    <SubmitButton submitting={submittingStatement} />
                                </div>
                            </form>
                            {topic.statements.map((x, i) => <h2 key={`statement_${i}`}>&ldquo;{x.text}&rdquo;</h2>)}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget;
        this.setState({ ...this.state, [name]: value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit(this.props.match.params.topicUrlFragment, this.state);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.topic),
    TopicStore.actionCreators,
)(Topic);
