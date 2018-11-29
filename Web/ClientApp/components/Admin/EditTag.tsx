import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { EditTagFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as EditTagStore from '../../store/EditTag';
import { focusFirstTextInput, onCtrlEnter } from '../../utils/html-utils';
import Loading from '../shared/Loading';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

type EditTagProps = EditTagStore.EditTagState
    & typeof EditTagStore.actionCreators
    & RouteComponentProps<{ tagSlug: string }>;

class EditTag extends React.Component<EditTagProps, EditTagFormModel> {

    constructor(props: EditTagProps) {
        super(props);

        this.state = {
            name: '',
            slug: '',
            description: '',
            moreInfoUrl: '',
            isApproved: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        if (this.shouldGetTag()) {
            this.props.getTag(this.props.match.params.tagSlug);
        }
    }

    public componentDidUpdate(prevProps: EditTagProps) {
        const { loadedModel } = this.props.tagModel;
        if (!prevProps.tagModel.loadedModel && loadedModel) {
            this.setState({
                name: loadedModel.name || '',
                slug: loadedModel.slug || '',
                description: loadedModel.description || '',
                moreInfoUrl: loadedModel.moreInfoUrl || '',
                isApproved: loadedModel.isApproved,
            });

            focusFirstTextInput('form');
            onCtrlEnter('form', () => this.submit());
        }
    }

    public render() {
        const { name, slug, description, moreInfoUrl, isApproved } = this.state;
        const { successfullySaved } = this.props;
        const { loadedModel } = this.props.tagModel;
        const { submitting, submitted, error } = this.props.editTagForm;
        const successUrl = (successfullySaved && loadedModel && loadedModel.isApproved)
            ? `/tags/${loadedModel.slug}`
            : null;

        return (
            <div className="row">
                <div className="col-lg-6 offset-lg-3">
                    <h2>Edit Tag</h2>
                    {loadedModel && successUrl && (
                        <div className="alert alert-success" role="alert">
                            "{loadedModel.name}" approved,
                        check it out: <Link to={successUrl}>{successUrl}</Link>
                        </div>
                    )}
                    <Loading {...this.props.tagModel} />
                    {loadedModel && (
                        <>
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}
                            <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Tag name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${submitted ? name ? 'is-valid' : 'is-invalid' : ''}`}
                                        id="name"
                                        name="name"
                                        maxLength={100}
                                        value={name}
                                        onChange={this.handleChange}
                                    />
                                    <div className="invalid-feedback">Tag name is required</div>
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
                                    <label htmlFor="description">Description (optional)</label>
                                    <SuperTextArea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        maxLength={280}
                                        submitted={submitted}
                                        value={description}
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
            </div>
        );
    }

    private shouldGetTag(): boolean {
        if (!this.props.tagModel.loadedModel) {
            return true;
        }
        return (this.props.tagModel.id !== this.props.match.params.tagSlug);
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
        this.submit();
    }

    private submit(): void {
        this.props.submit(this.props.tagModel.id!, this.state);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.editTag),
    EditTagStore.actionCreators,
)(EditTag);
