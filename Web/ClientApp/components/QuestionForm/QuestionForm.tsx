import * as React from 'react';
import { QuestionFormModel, TagValueModel } from '../../server-models';
import { enableConfirmOnLeave, onCtrlEnter } from '../../utils/html-utils';
import QuestionSearchResults from '../QuestionSearch/QuestionSearchResults';
import Emoji, { EmojiValue } from '../shared/Emoji';
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
                source: props.initialState.source,
                tags: props.initialState.tags,
            } :
            { text: '', source: '', tags: props.initialTagValues || [] };

        this.questionTextInputRef = React.createRef<SuperTextArea>();

        this.handleChange = this.handleChange.bind(this);
        this.handleTagsChange = this.handleTagsChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        this.questionTextInputRef.current!.focus();
        onCtrlEnter('form', () => this.submit());
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will reset the form when a Question has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '', tags: [] });
        }
    }

    public componentDidUpdate() {
        enableConfirmOnLeave(this.shouldConfirmOnLeave());
    }

    public render() {
        const { isModal, onCloseModalRequested, error, submitting, submitted } = this.props;
        const { text, source, tags } = this.state;

        return (
            <form className="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="questionText">Question</label>
                        <div className="emoji-over-text-area">
                            <Emoji value={EmojiValue.Question} />
                        </div>
                        <SuperTextArea
                            id="questionText"
                            ref={this.questionTextInputRef}
                            name="text"
                            className="form-control emoji-text-area"
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
                        <label htmlFor="questionSource">Source (optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="questionSource"
                            name="source"
                            value={source}
                            maxLength={2000}
                            onChange={this.handleChange}
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
        const { text, source } = this.state;
        return (!!text || !!source);
    }
}
