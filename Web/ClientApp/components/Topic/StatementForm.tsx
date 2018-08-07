import * as React from 'react';
import { StatementFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import StanceInput from './StanceInput';

type Props = FormProps<StatementFormModel>
    & { topicSlug?: string, hideInfoBox?: boolean, isModal?: boolean, onCloseModalRequested?: () => void };

export default class StatementForm extends React.Component<Props, StatementFormModel> {

    constructor(props: Props) {
        super(props);

        this.state = (props.initialState) ?
            {
                text: props.initialState.text,
                source: props.initialState.source,
                stance: props.initialState.stance,
                topicSlugs: props.initialState.topicSlugs,
            } :
            { text: '', source: '', stance: 'NA', topicSlugs: [props.topicSlug!] };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will reset the form when a statement has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '', stance: 'NA' });
        }
    }

    public render() {
        const { hideInfoBox, isModal, onCloseModalRequested, error, submitting, submitted } = this.props;
        const { text, stance, source } = this.state;
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
                    <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                        <label htmlFor="statementText">Statement</label>
                        <div className="statement statement-floating-quotes" />
                        <SuperTextArea
                            id="statementText"
                            name="text"
                            className="statement-text-area"
                            value={text}
                            maxLength={280}
                            onChange={this.handleChange}
                        />
                        {submitted && !text && <div className="help-block">Text is required</div>}
                    </div>
                    <div className="form-group">
                        <label>Stance</label>
                        <div>
                            <StanceInput
                                name="stance"
                                value={stance}
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="statementSource">Source (optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="statementSource"
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

    private handleChange(event: React.FormEvent<HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement>): void {
        const { name, value } = event.currentTarget;
        this.setState((prevState) => ({ ...prevState, [name]: value }));
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
