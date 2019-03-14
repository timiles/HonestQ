import * as React from 'react';
import { connect } from 'react-redux';
import { Prompt, RouteComponentProps } from 'react-router-dom';
import { TagFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewTagStore from '../../store/NewTag';
import { enableConfirmOnLeave, getValidationClassName, onCtrlEnter } from '../../utils/html-utils';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

type NewTagProps = NewTagStore.NewTagState
    & typeof NewTagStore.actionCreators
    & RouteComponentProps<{}>;

class NewTag extends React.Component<NewTagProps, TagFormModel> {

    private readonly tagNameInputRef: React.RefObject<HTMLInputElement>;

    constructor(props: NewTagProps) {
        super(props);

        this.state = {
            name: '',
            description: '',
            moreInfoUrl: '',
        };

        this.tagNameInputRef = React.createRef<HTMLInputElement>();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        this.tagNameInputRef.current!.focus();
        onCtrlEnter('form', () => this.submit());
    }

    public componentDidUpdate(prevProps: NewTagProps) {
        if (prevProps.submitted && !this.props.submitted) {
            // Reset the form when a tag has been successfully submitted
            this.setState({
                name: '',
                description: '',
                moreInfoUrl: '',
            }, () => { enableConfirmOnLeave(false); });
        } else {
            enableConfirmOnLeave(this.shouldConfirmOnLeave());
        }
    }

    public render() {
        const { name, description, moreInfoUrl } = this.state;
        const { submitting, submitted, error } = this.props;
        const previous = this.props.previouslySubmittedTagFormModel;
        return (
            <>
                <Prompt
                    when={this.shouldConfirmOnLeave()}
                    message="You have unsaved changes, are you sure you want to leave?"
                />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3">
                            <h2>Suggest a new tag</h2>
                            {previous && (
                                <div className="alert alert-success" role="alert">
                                    Your tag "{previous.name}" has been created and is awaiting approval!
                        </div>
                            )}
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}
                            <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Tag name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${getValidationClassName(submitted, name)}`}
                                        id="name"
                                        ref={this.tagNameInputRef}
                                        name="name"
                                        maxLength={100}
                                        value={name}
                                        onChange={this.handleChange}
                                    />
                                    <div className="invalid-feedback">Tag name is required</div>
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
                                    <label htmlFor="moreInfoUrl">
                                        Link to more info, e.g. a Wikipedia page (optional)
                                    </label>
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
                                <div className="form-group">
                                    <SubmitButton submitting={submitting} />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        const { name, value } = event.currentTarget;
        this.setState((prevState) => ({ ...prevState, [name]: value }));
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.submit();
    }

    private submit(): void {
        this.props.submit(this.state);
    }

    private shouldConfirmOnLeave(): boolean {
        const { name, description, moreInfoUrl } = this.state;
        return (!!name || !!description || !!moreInfoUrl);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newTag),
    NewTagStore.actionCreators,
)(NewTag);
