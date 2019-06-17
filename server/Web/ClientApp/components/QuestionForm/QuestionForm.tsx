import React from 'react';
import { QuestionFormModel, TagValueModel } from '../../server-models';
import { enableConfirmOnLeave, onCtrlEnter } from '../../utils/html-utils';
import QuestionSearchResults from '../QuestionSearch/QuestionSearchResults';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import TagAutocomplete from '../Tag/TagAutocomplete';

type Props = FormProps<QuestionFormModel>
    & {
        initialTagValues?: TagValueModel[],
        isModal?: boolean,
        onCloseModalRequested?: () => void,
    };

export default class QuestionForm extends React.Component<Props, QuestionFormModel> {

    private readonly questionTextInputRef: React.RefObject<SuperTextArea>;

    constructor(props: Props) {
        super(props);

        this.state = (props.initialState) ?
            {
                text: props.initialState.text,
                context: props.initialState.context,
                tags: props.initialState.tags,
            } :
            { text: '', context: '', tags: props.initialTagValues || [] };

        this.questionTextInputRef = React.createRef<SuperTextArea>();

        this.handleChange = this.handleChange.bind(this);
        this.handleTagsChange = this.handleTagsChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        this.questionTextInputRef.current!.focus();
        onCtrlEnter('form', () => this.submit());
    }

    public componentDidUpdate() {
        enableConfirmOnLeave(this.shouldConfirmOnLeave());
    }

    public componentWillUnmount() {
        enableConfirmOnLeave(false);
    }

    public render() {
        const { isModal, onCloseModalRequested, error, submitting, submitted } = this.props;
        const { text, context, tags } = this.state;

        return (
            <form className="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="questionText">Question</label>
                        <SuperTextArea
                            id="questionText"
                            ref={this.questionTextInputRef}
                            name="text"
                            className="form-control"
                            maxLength={280}
                            required={true}
                            submitted={submitted}
                            value={text}
                            onChange={this.handleChange}
                        />
                        <QuestionSearchResults
                            containerClassName="bs-callout bs-callout-info"
                            headerText="Related questions?"
                            hideWhenNoResults={true}
                            query={text}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="questionContext">Context (optional)</label>
                        <label id="contextHelpBlock" className="form-text small text-muted mb-2">
                            Provide context if it would help people to understand why you are asking this question.
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="questionContext"
                            name="context"
                            value={context}
                            maxLength={2000}
                            onChange={this.handleChange}
                            aria-describedby="contextHelpBlock"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tags (optional)</label>
                        <div>
                            <TagAutocomplete
                                name="tagSlugs"
                                selectedTags={tags}
                                onChange={this.handleTagsChange}
                            />
                        </div>
                    </div>
                </div>
                <div className={isModal ? 'modal-footer' : 'form-group'}>
                    {isModal && onCloseModalRequested &&
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCloseModalRequested}
                        >
                            Close
                        </button>}
                    <SubmitButton submitting={submitting} />
                </div>
            </form>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement>): void {
        const { name, value } = event.target as HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement;
        this.setState((prevState) => ({ ...prevState, [name]: value }));
    }

    private handleTagsChange(selectedTags: TagValueModel[]): void {
        this.setState({ tags: selectedTags });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.submit();
    }

    private submit(): void {
        this.props.submit!(this.state);
    }

    private shouldConfirmOnLeave(): boolean {
        const { text, context } = this.state;
        return (!!text || !!context);
    }
}
