import * as React from 'react';
import { QuestionFormModel, TopicValueModel } from '../../server-models';
import Emoji, { EmojiValue } from '../shared/Emoji';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import TopicAutocomplete from '../Topic/TopicAutocomplete';

type Props = FormProps<QuestionFormModel>
    & {
    initialTopicValues?: TopicValueModel[],
    isModal?: boolean,
    onCloseModalRequested?: () => void,
};

export default class QuestionForm extends React.Component<Props, QuestionFormModel> {

    constructor(props: Props) {
        super(props);

        this.state = (props.initialState) ?
            {
                text: props.initialState.text,
                source: props.initialState.source,
                topics: props.initialState.topics,
            } :
            { text: '', source: '', topics: props.initialTopicValues || [] };

        this.handleChange = this.handleChange.bind(this);
        this.handleTopicsChange = this.handleTopicsChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will reset the form when a Question has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '', topics: [] });
        }
    }

    public render() {
        const { isModal, onCloseModalRequested, error, submitting, submitted } = this.props;
        const { text, source, topics } = this.state;

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
                            name="text"
                            className={`form-control emoji-text-area
                                ${submitted ? text ? 'is-valid' : 'is-invalid' : ''}`}
                            value={text}
                            maxLength={280}
                            onChange={this.handleChange}
                        />
                        <div className="invalid-feedback">Text is required</div>
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
                        <label>Topics (optional)</label>
                        <div>
                            <TopicAutocomplete
                                name="topicSlugs"
                                selectedTopics={topics}
                                onChange={this.handleTopicsChange}
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

    private handleTopicsChange(selectedTopics: TopicValueModel[]): void {
        this.setState({ topics: selectedTopics });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
