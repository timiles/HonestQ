import * as React from 'react';
import { CommentFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import AgreementRatingScale from './AgreementRatingScale';

export default class CommentForm extends React.Component<FormProps<CommentFormModel>, CommentFormModel> {

    constructor(props: FormProps<CommentFormModel>) {
        super(props);

        this.state = { text: '', agreementRating: 'Neutral' };

        this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
        this.handleAgreementRatingChange = this.handleAgreementRatingChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: FormProps<CommentFormModel>) {
        // This will reset the form when a comment has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', agreementRating: 'Neutral' });
        }
    }

    public render() {
        const { submitting, submitted, error } = this.props;
        const { text, agreementRating } = this.state;
        return (
            <>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                        <label htmlFor="text">Comment</label>
                        <SuperTextArea
                            value={text}
                            maxLength={280}
                            onChange={this.handleTextAreaChange}
                        />
                        {submitted && !text && <div className="help-block">Text is required</div>}
                    </div>
                    <div className="form-group">
                        <AgreementRatingScale value={agreementRating} onChange={this.handleAgreementRatingChange} />
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

    private handleAgreementRatingChange(name: string, value: string): void {
        this.setState({ agreementRating: value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
