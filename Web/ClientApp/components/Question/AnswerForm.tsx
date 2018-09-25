import * as React from 'react';
import { AnswerFormModel } from '../../server-models';
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

    constructor(props: Props) {
        super(props);

        this.state = {
            text: '',
            source: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: FormProps<AnswerFormModel>) {
        // This will reset the form when an Answer has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '' });
        }
    }

    public render() {
        const { isModal, onCloseModalRequested, submitting, submitted, error } = this.props;
        const { text, source } = this.state;

        return (
            <form name="form" autoComplete="off" onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                        <label htmlFor="answerText">Answer</label>
                        <div className="poptype-over-text-area">
                            <Emoji value={EmojiValue.Answer} />
                        </div>
                        <SuperTextArea
                            id="answerText"
                            name="text"
                            className="pop-text-area"
                            value={text}
                            maxLength={280}
                            onChange={this.handleChange}
                        />
                        {submitted && !text &&
                            <div className="help-block">Text is required</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="answerSource">Source</label>
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
        this.props.submit!(this.state);
    }
}
