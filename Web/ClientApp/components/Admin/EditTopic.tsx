import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { EditTopicFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as EditTopicStore from '../../store/EditTopic';
import Loading from '../shared/Loading';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

type EditTopicProps = EditTopicStore.EditTopicState
    & typeof EditTopicStore.actionCreators
    & RouteComponentProps<{ topicSlug: string }>;

class EditTopic extends React.Component<EditTopicProps, EditTopicFormModel> {

    constructor(props: EditTopicProps) {
        super(props);

        this.state = {
            name: '',
            slug: '',
            summary: '',
            moreInfoUrl: '',
            isApproved: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        if (this.shouldGetTopic()) {
            this.props.getTopic(this.props.match.params.topicSlug);
        }
    }

    public componentDidUpdate(prevProps: EditTopicProps) {
        const { model } = this.props.topicModel;
        if (!prevProps.topicModel.model && model) {
            this.setState({
                name: model.name || '',
                slug: model.slug || '',
                summary: model.summary || '',
                moreInfoUrl: model.moreInfoUrl || '',
                isApproved: model.isApproved,
            });
        }
    }

    public render() {
        const { name, slug, summary, moreInfoUrl, isApproved } = this.state;
        const { successfullySaved } = this.props;
        const { model } = this.props.topicModel;
        const { submitting, submitted, error } = this.props.editTopicForm;
        return (
            <div className="col-md-6 offset-md-3">
                <h2>Edit Topic</h2>
                {successfullySaved && model && model.isApproved && (
                    <div className="alert alert-success" role="alert">
                        "{model.name}" approved,
                        check it out: <Link to={`/${model.slug}`}>{`/${model.slug}`}</Link>
                    </div>
                )}
                <Loading {...this.props.topicModel} />
                {model && (
                    <>
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
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="moreInfoUrl">Link to more info, e.g. a Wikipedia page</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="moreInfoUrl"
                                    name="moreInfoUrl"
                                    maxLength={2000}
                                    value={moreInfoUrl}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form-group form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="isApproved"
                                    name="isApproved"
                                    checked={isApproved}
                                    onChange={this.handleChange}
                                />
                                <label className="form-check-label" htmlFor="isApproved">Mark as Approved</label>
                            </div>
                            <div className="form-group">
                                <SubmitButton submitting={submitting} />
                            </div>
                        </form>
                    </>
                )}
            </div>
        );
    }

    private shouldGetTopic(): boolean {
        if (!this.props.topicModel.model) {
            return true;
        }
        return (this.props.topicModel.id !== this.props.match.params.topicSlug);
    }

    private handleChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        const { name } = event.currentTarget;
        if (event.currentTarget instanceof HTMLInputElement && event.currentTarget.type === 'checkbox') {
            const { checked } = event.currentTarget;
            this.setState((prevState) => ({ ...prevState, [name]: checked }));
        } else {
            const { value } = event.currentTarget;
            this.setState((prevState) => ({ ...prevState, [name]: value }));
        }
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit(this.props.topicModel.id!, this.state);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.editTopic),
    EditTopicStore.actionCreators,
)(EditTopic);
