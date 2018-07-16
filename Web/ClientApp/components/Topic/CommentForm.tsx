import * as React from 'react';
import { CommentFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import AgreementRatingScale from './AgreementRatingScale';

type Props = FormProps<CommentFormModel>
    & { isSourceOnly?: boolean, isModal?: boolean, onCloseModalRequested?: () => void };

export default class CommentForm extends React.Component<Props, CommentFormModel> {

    constructor(props: Props) {
        super(props);

        this.state = { text: '', source: '', agreementRating: 'Neutral' };

        this.handleChange = this.handleChange.bind(this);
        this.handleAgreementRatingChange = this.handleAgreementRatingChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: FormProps<CommentFormModel>) {
        // This will reset the form when a comment has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '', agreementRating: 'Neutral' });
        }
    }

    public render() {
        const { isSourceOnly, isModal, onCloseModalRequested, submitting, submitted, error } = this.props;
        const { text, source, agreementRating } = this.state;

        return (
            <form name="form" autoComplete="off" onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {!isSourceOnly &&
                        <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                            <label htmlFor="commentText">Comment</label>
                            <SuperTextArea
                                id="commentText"
                                name="text"
                                value={text}
                                maxLength={280}
                                onChange={this.handleChange}
                            />
                            {submitted && !text && !source &&
                                <div className="help-block">Text or Source is required</div>}
                        </div>
                    }
                    <div className="form-group">
                        <label htmlFor="commentSource">Source</label>
                        <input
                            type="text"
                            className="form-control"
                            id="commentSource"
                            name="source"
                            value={source}
                            maxLength={2000}
                            onChange={this.handleChange}
                        />
                        {submitted && !text && !source && !isSourceOnly &&
                            <div className="help-block">Text or Source is required</div>
                        }
                        {submitted && !source && isSourceOnly &&
                            <div className="help-block">Source is required</div>
                        }
                    </div>
                    {!isSourceOnly &&
                        <div className="form-group">
                            <AgreementRatingScale value={agreementRating} onChange={this.handleAgreementRatingChange} />
                        </div>
                    }
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

    private handleChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        const { name, value } = event.currentTarget;
        this.setState((prevState) => ({ ...prevState, [name]: value }));
    }

    private handleAgreementRatingChange(name: string, value: string): void {
        this.setState({ agreementRating: value });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
