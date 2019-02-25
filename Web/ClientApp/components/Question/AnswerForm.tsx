import * as React from 'react';
import { AnswerFormModel } from '../../server-models';
import { enableConfirmOnLeave, onCtrlEnter } from '../../utils/html-utils';
import Emoji, { EmojiValue } from '../shared/Emoji';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

type Props = FormProps<AnswerFormModel>
    & AnswerFormProps;

interface AnswerFormProps {
    isModal?: boolean;
    onCloseModalRequested?: () => void;
}

export default class AnswerForm extends React.Component<Props, AnswerFormModel> {

    private readonly answerTextInputRef: React.RefObject<SuperTextArea>;
    constructor(props: Props) {
        super(props);

        this.state = (props.initialState) ?
            {
                text: props.initialState.text,
                source: props.initialState.source,
            } :
            { text: '', source: '' };

        this.answerTextInputRef = React.createRef<SuperTextArea>();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        this.answerTextInputRef.current!.focus();
        onCtrlEnter('form', () => this.submit());
    }

    public UNSAFE_componentWillReceiveProps(nextProps: FormProps<AnswerFormModel>) {
        // This will reset the form when an Answer has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '' });
        }
    }

    public componentDidUpdate() {
        enableConfirmOnLeave(this.shouldConfirmOnLeave());
    }

    public render() {
        const { isModal, onCloseModalRequested, submitting, submitted, error } = this.props;
        const { text, source } = this.state;

        return (
            <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="answerText">Answer</label>
                        <div className="emoji-over-text-area">
                            <Emoji value={EmojiValue.Answer} />
                        </div>
                        <SuperTextArea
                            id="answerText"
                            ref={this.answerTextInputRef}
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
                        <label htmlFor="answerSource">Source (optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="answerSource"
                            name="source"
                            value={source}
                            maxLength={2000}
                            onChange={this.handleChange}
                        />
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

    private handleChange(event: React.FormEvent<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>): void {
        const { name, value } = event.currentTarget;
        this.setState((prevState) => ({ ...prevState, [name]: value }));
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
