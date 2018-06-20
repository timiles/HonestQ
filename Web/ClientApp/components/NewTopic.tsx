import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
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
            slug: '',
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
                slug: '',
                summary: '',
                moreInfoUrl: '',
            });
        }
    }

    public render() {
        const { name, slug, summary, moreInfoUrl } = this.state;
        const { submitting, submitted, error } = this.props;
        const previous = this.props.previouslySubmittedTopicFormModel;
        return (
            <div className="col-md-6">
                <h2>Submit New Topic</h2>
                {previous && (
                    <div className="alert alert-success" role="alert">
                        Your topic "{previous.name}" has been created!
                        Check it out: <Link to={`/${previous.slug}`}>{`/${previous.slug}`}</Link>
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
                    <div className={'form-group' + (submitted && !slug ? ' has-error' : '')}>
                        <label htmlFor="slug">Slug</label>
                        <input
                            type="text"
                            className="form-control"
                            id="slug"
                            name="slug"
                            maxLength={100}
                            value={slug}
                            onChange={this.handleChange}
                        />
                        {submitted && !slug && <div className="help-block">Slug is required</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="summary">Summary</label>
                        <SuperTextArea
                            id="summary"
                            name="summary"
                            maxLength={280}
                            value={summary}
                            onChange={this.handleSuperTextAreaChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="moreInfoUrl">Link to more info, e.g. a Wikipedia page</label>
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
