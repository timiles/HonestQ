import * as React from 'react';
import { AdminQuestionFormModel, TagValueModel } from '../../server-models';
import { onCtrlEnter } from '../../utils/html-utils';
import Emoji, { EmojiValue } from '../shared/Emoji';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import TagAutocomplete from '../Tag/TagAutocomplete';

type Props = FormProps<AdminQuestionFormModel>;

export default class AdminQuestionForm extends React.Component<Props, AdminQuestionFormModel> {

    private readonly questionTextInputRef: React.RefObject<SuperTextArea>;

    constructor(props: Props) {
        super(props);

        this.state = (props.initialState) ?
            {
                text: props.initialState.text,
                source: props.initialState.source,
                tags: props.initialState.tags,
                isApproved: props.initialState.isApproved,
            } :
            { text: '', source: '', tags: [], isApproved: false };

        this.questionTextInputRef = React.createRef<SuperTextArea>();

        this.handleChange = this.handleChange.bind(this);
        this.handleTagsChange = this.handleTagsChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        this.questionTextInputRef.current!.focus();
        onCtrlEnter('form', () => this.submit());
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Props) {
        // This will reset the form when a Question has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '', tags: [] });
        }
    }

    public render() {
        const { error, submitting, submitted } = this.props;
        const { text, source, tags, isApproved } = this.state;

        return (
            <form className="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
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
                <SubmitButton submitting={submitting} />
            </form>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement>): void {
        const { name } = event.currentTarget;
        if (event.currentTarget instanceof HTMLInputElement && event.currentTarget.type === 'checkbox') {
            const { checked } = event.currentTarget;
            this.setState((prevState) => ({ ...prevState, [name]: checked }));
        } else {
            const { value } = event.currentTarget;
            this.setState((prevState) => ({ ...prevState, [name]: value }));
        }
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
}
