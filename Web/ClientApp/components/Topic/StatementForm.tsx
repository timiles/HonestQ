import * as React from 'react';
import { StatementFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

export default class StatementForm extends React.Component<FormProps<StatementFormModel>, StatementFormModel> {

    constructor(props: FormProps<StatementFormModel>) {
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
        const { error, submitting, submitted } = this.props;
        const { text } = this.state;
        return (
            <>
                <h2>Submit New Statement</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                        <label htmlFor="text">Statement</label>
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
