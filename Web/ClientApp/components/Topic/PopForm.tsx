import * as React from 'react';
import { PopFormModel, TopicValueStanceModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import PopTypeView from '../shared/PopTypeView';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import PopTypeInput from './PopTypeInput';
import TopicAutocomplete from './TopicAutocomplete';

type Props = FormProps<PopFormModel>
    & {
    initialTopicValues?: TopicValueStanceModel[],
    hideInfoBox?: boolean,
    isModal?: boolean,
    onCloseModalRequested?: () => void,
};

export default class PopForm extends React.Component<Props, PopFormModel> {

    constructor(props: Props) {
        super(props);

        this.state = (props.initialState) ?
            {
                text: props.initialState.text,
                source: props.initialState.source,
                type: props.initialState.type,
                topics: props.initialState.topics,
            } :
            { text: '', source: '', type: 'Statement', topics: props.initialTopicValues || [] };

        this.handleChange = this.handleChange.bind(this);
        this.handleTopicsChange = this.handleTopicsChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will reset the form when a pop has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '', type: 'Statement', topics: [] });
        }
    }

    public render() {
        const { hideInfoBox, isModal, onCloseModalRequested, error, submitting, submitted } = this.props;
        const { text, type, source, topics } = this.state;
        return (
            <form className="form" autoComplete="off" onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {!hideInfoBox &&
                        <div className="alert alert-info" role="alert">
                            <p>Please remember, Statements under a Topic are:</p>
                            <ul>
                                <li>Unique</li>
                                <li>Anonymous</li>
                                <li>A general summary of a fact or opinion that people believe</li>
                            </ul>
                            <p>
                                Once you have submitted a Statement, you can then discuss whether you agree with it,
                                provide further info, and see other people's points of view in the Comments section.
                    </p>
                        </div>
                    }
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="form-group">
                        <label>Type</label>
                        <div>
                            <PopTypeInput
                                name="type"
                                value={type}
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
                    <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                        <label htmlFor="popText">{type.toSentenceCase()}</label>
                        <div className="poptype-over-text-area">
                            <PopTypeView value={type} />
                        </div>
                        <SuperTextArea
                            id="popText"
                            name="text"
                            className="pop-text-area"
                            value={text}
                            maxLength={280}
                            onChange={this.handleChange}
                        />
                        {submitted && !text && <div className="help-block">Text is required</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="popSource">Source (optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="popSource"
                            name="source"
                            value={source}
                            maxLength={2000}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Topics</label>
                        <div>
                            <TopicAutocomplete
                                name="topicSlugs"
                                includeStance={type === 'Statement'}
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
        const { name, value } = event.currentTarget;

        const topics = this.state.topics;
        if (name === 'type') {
            if (value === 'Statement') {
                topics.forEach((x) => x.stance = 'Neutral');
            } else {
                // REVIEW: This should be null
                topics.forEach((x) => x.stance = undefined);
            }
        }

        this.setState((prevState) => ({ ...prevState, [name]: value, topics }));
    }

    private handleTopicsChange(selectedTopics: TopicValueStanceModel[]): void {
        this.setState({ topics: selectedTopics });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
