import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { PostTopicFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewTopicStore from '../store/NewTopic';
import SubmitButton from './shared/SubmitButton';

type NewTopicProps = NewTopicStore.NewTopicState
    & typeof NewTopicStore.actionCreators
    & RouteComponentProps<{}>;

class NewTopic extends React.Component<NewTopicProps, PostTopicFormModel> {

    constructor(props: NewTopicProps) {
        super(props);

        this.state = {
            name: '',
            urlFragment: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: NewTopicProps) {
        // This will reset the form when a topic has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({
                name: '',
                urlFragment: '',
            });
        }
    }

    public render() {
        const { name, urlFragment } = this.state;
        const { submitting, submitted, error } = this.props;
        const previous = this.props.previouslySubmittedTopicFormModel;
        return (
            <div className="col-md-6">
                <h2>Submit New Topic</h2>
                {previous && (
                    <div className="alert alert-success" role="alert">
                        Your topic "{previous.name}" has been created!
                        Check it out: <Link to={`/${previous.urlFragment}`}>{`/${previous.urlFragment}`}</Link>
                    </div>
                )}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !name ? ' has-error' : '')}>
                        <label htmlFor="name">Topic name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={name}
                            onChange={this.handleChange}
                        />
                        {submitted && !name && <div className="help-block">Topic name is required</div>}
                    </div>
                    <div className={'form-group' + (submitted && !urlFragment ? ' has-error' : '')}>
                        <label htmlFor="urlFragment">Url fragment</label>
                        <input
                            type="text"
                            className="form-control"
                            name="urlFragment"
                            value={urlFragment}
                            onChange={this.handleChange}
                        />
                        {submitted && !urlFragment && <div className="help-block">Url fragment is required</div>}
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

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit(this.state);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newTopic),
    NewTopicStore.actionCreators,
)(NewTopic);
