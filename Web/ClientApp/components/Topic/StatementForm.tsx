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
                <p>Don't worry, these statements are all presented anonymously.</p>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                        <SuperTextArea
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

    private handleTextAreaChange(value: string): void {
        this.setState({ text: value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
