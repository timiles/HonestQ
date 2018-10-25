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
        const { loadedModel } = this.props.topicModel;
        if (!prevProps.topicModel.loadedModel && loadedModel) {
            this.setState({
                name: loadedModel.name || '',
                slug: loadedModel.slug || '',
                summary: loadedModel.summary || '',
                moreInfoUrl: loadedModel.moreInfoUrl || '',
                isApproved: loadedModel.isApproved,
            });
        }
    }

    public render() {
        const { name, slug, summary, moreInfoUrl, isApproved } = this.state;
        const { successfullySaved } = this.props;
        const { loadedModel } = this.props.topicModel;
        const { submitting, submitted, error } = this.props.editTopicForm;
        const successUrl = (successfullySaved && loadedModel && loadedModel.isApproved)
            ? `/topics/${loadedModel.slug}`
            : null;

        return (
            <div className="col-lg-6 offset-lg-3">
                <h2>Edit Topic</h2>
                {loadedModel && successUrl && (
                    <div className="alert alert-success" role="alert">
                        "{loadedModel.name}" approved,
                        check it out: <Link to={successUrl}>{successUrl}</Link>
                    </div>
                )}
                <Loading {...this.props.topicModel} />
                {loadedModel && (
                    <>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Topic name</label>
                                <input
                                    type="text"
                                    className={`form-control ${submitted ? name ? 'is-valid' : 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    maxLength={100}
                                    value={name}
                                    onChange={this.handleChange}
                                />
                                <div className="invalid-feedback">Topic name is required</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="slug">Slug</label>
                                <input
                                    type="text"
                                    className={`form-control ${submitted ? slug ? 'is-valid' : 'is-invalid' : ''}`}
                                    id="slug"
                                    name="slug"
                                    maxLength={100}
                                    value={slug}
                                    onChange={this.handleChange}
                                />
                                <div className="invalid-feedback">Slug is required</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="summary">Summary</label>
                                <SuperTextArea
                                    className="form-control"
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
        if (!this.props.topicModel.loadedModel) {
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
