import * as React from 'react';
import { StatementFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

type StatementFormProps = FormProps<StatementFormModel>
    & { numberOfStatementsInTopic: number };

export default class StatementForm extends React.Component<StatementFormProps, StatementFormModel> {

    constructor(props: StatementFormProps) {
        super(props);

        this.state = { text: '' };

        this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: FormProps<StatementFormModel>) {
        // This will reset the form when a statement has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '' });
        }
    }

    public render() {
        const { numberOfStatementsInTopic, error, submitting, submitted } = this.props;
        const headerText = numberOfStatementsInTopic === 0 ? 'Start the conversation' : 'Got something to add?';
        const { text } = this.state;
        return (
            <>
                <h2>{headerText}</h2>
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
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form className="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                        <label htmlFor="statementText">Statement</label>
                        <div className="statement statement-floating-quotes" />
                        <SuperTextArea
                            id="statementText"
                            className="statement-text-area"
                            value={text}
                            maxLength={280}
                            onChange={this.handleTextAreaChange}
                        />
                        {submitted && !text && <div className="help-block">Text is required</div>}
                    </div>
                    <div className="form-group">
                        <SubmitButton submitting={submitting} />
                    </div>
                </form>
            </>
        );
    }

    private handleTextAreaChange(name: string, value: string): void {
        this.setState({ text: value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
