import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { TopicFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewTopicStore from '../store/NewTopic';
import SubmitButton from './shared/SubmitButton';
import SuperTextArea from './shared/SuperTextArea';

type NewTopicProps = NewTopicStore.NewTopicState
    & typeof NewTopicStore.actionCreators
    & RouteComponentProps<{}>;

class NewTopic extends React.Component<NewTopicProps, TopicFormModel> {

    constructor(props: NewTopicProps) {
        super(props);

        this.state = {
            name: '',
            summary: '',
            moreInfoUrl: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSuperTextAreaChange = this.handleSuperTextAreaChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: NewTopicProps) {
        // This will reset the form when a topic has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({
                name: '',
                summary: '',
                moreInfoUrl: '',
            });
        }
    }

    public render() {
        const { name, summary, moreInfoUrl } = this.state;
        const { submitting, submitted, error } = this.props;
        const previous = this.props.previouslySubmittedTopicFormModel;
        return (
            <div className="col-md-6">
                <h2>Suggest a new Topic</h2>
                {previous && (
                    <div className="alert alert-success" role="alert">
                        Your topic "{previous.name}" has been created and is awaiting approval!
                    </div>
                )}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" autoComplete="off" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !name ? ' has-error' : '')}>
                        <label htmlFor="name">Topic name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            maxLength={100}
                            value={name}
                            onChange={this.handleChange}
                        />
                        {submitted && !name && <div className="help-block">Topic name is required</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="summary">Summary (optional)</label>
                        <SuperTextArea
                            id="summary"
                            name="summary"
                            maxLength={280}
                            value={summary}
                            onChange={this.handleSuperTextAreaChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="moreInfoUrl">Link to more info, e.g. a Wikipedia page (optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="moreInfoUrl"
                            name="moreInfoUrl"
                            maxLength={100}
                            value={moreInfoUrl}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <SubmitButton submitting={submitting} />
                    </div>
                </form>
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const { name, value } = event.currentTarget;
        this.setState({ ...this.state, [name]: value });
    }

    private handleSuperTextAreaChange(name: string, value: string): void {
        this.setState({ ...this.state, [name]: value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit(this.state);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newTopic),
    NewTopicStore.actionCreators,
)(NewTopic);
