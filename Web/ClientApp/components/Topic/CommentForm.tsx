import * as React from 'react';
import { CommentFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

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
        const agreementRatingValues = ['StronglyDisagree', 'Disagree', 'Neutral', 'Agree', 'StronglyAgree'];
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
                        <ul className="rating-scale">
                            {agreementRatingValues.map((x: string, i: number) =>
                                <li key={`agreementRating${i}`}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="agreementRating"
                                            value={x}
                                            onChange={this.handleAgreementRatingChange}
                                            checked={agreementRating === x}
                                        />
                                        {x.toSentenceCase()}
                                    </label>
                                </li>)
                            }
                        </ul>
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

    private handleAgreementRatingChange(event: React.FormEvent<HTMLInputElement>): void {
        this.setState({ agreementRating: event.currentTarget.value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
