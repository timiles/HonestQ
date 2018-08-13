import * as React from 'react';
import { CommentFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import AgreementRatingScale from './AgreementRatingScale';

type Props = FormProps<CommentFormModel>
    & CommentFormProps;

interface CommentFormProps {
    type: string;
    isModal?: boolean;
    onCloseModalRequested?: () => void;
    parentCommentId: number | null;
}

export default class CommentForm extends React.Component<Props, CommentFormModel> {

    private readonly hideAgreementRating: boolean;
    private readonly hideText: boolean;

    constructor(props: Props) {
        super(props);

        this.hideAgreementRating = this.props.type === 'RequestForProof'
            || this.props.type === 'Question'
            || !!this.props.parentCommentId;
        this.hideText = (this.props.type === 'RequestForProof');

        this.state = {
            text: '',
            source: '',
            agreementRating: this.hideAgreementRating ? '' : 'Neutral',
            parentCommentId: this.props.parentCommentId,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleAgreementRatingChange = this.handleAgreementRatingChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: FormProps<CommentFormModel>) {
        // This will reset the form when a comment has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '' });
        }
    }

    public render() {
        const { type, isModal, onCloseModalRequested, submitting, submitted, error } = this.props;
        const { text, source, agreementRating } = this.state;

        const label = (type === 'Question') ? 'Answer' : 'Comment';

        return (
            <form name="form" autoComplete="off" onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {!this.hideText &&
                        <div className={'form-group' + (submitted && !text ? ' has-error' : '')}>
                            <label htmlFor="commentText">{label}</label>
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
                        {submitted && !text && !this.hideText && !source &&
                            <div className="help-block">Text or Source is required</div>
                        }
                        {submitted && this.hideText && !source &&
                            <div className="help-block">Source is required</div>
                        }
                    </div>
                    {!this.hideAgreementRating &&
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