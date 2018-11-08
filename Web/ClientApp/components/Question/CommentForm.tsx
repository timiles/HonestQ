import * as React from 'react';
import { CommentFormModel } from '../../server-models';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import AgreementRatingInput from './AgreementRatingInput';

type Props = FormProps<CommentFormModel>
    & CommentFormProps;

interface CommentFormProps {
    isModal?: boolean;
    onCloseModalRequested?: () => void;
    parentCommentId?: number;
}

export default class CommentForm extends React.Component<Props, CommentFormModel> {

    constructor(props: Props) {
        super(props);

        this.state = {
            text: '',
            source: '',
            agreementRating: 'Neutral',
            parentCommentId: this.props.parentCommentId,
            isAnonymous: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: FormProps<CommentFormModel>) {
        // This will reset the form when a Comment has been successfully submitted
        if (!nextProps.submitted) {
            this.setState({ text: '', source: '' });
        }
    }

    public render() {
        const { isModal, onCloseModalRequested, submitting, submitted, error } = this.props;
        const { text, source, agreementRating, isAnonymous } = this.state;

        return (
            <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="commentText">Comment</label>
                        <SuperTextArea
                            id="commentText"
                            name="text"
                            className={`form-control
                                ${submitted ? text ? 'is-valid' : 'is-invalid' : ''}`}
                            value={text}
                            maxLength={280}
                            onChange={this.handleChange}
                        />
                        <div className="invalid-feedback">Comment is required</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="commentSource">Source (optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="commentSource"
                            name="source"
                            value={source}
                            maxLength={2000}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="agreementRating">Agreement rating</label>
                        <div>
                            <AgreementRatingInput
                                name="agreementRating"
                                value={agreementRating}
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isAnonymous"
                                    checked={isAnonymous}
                                    onChange={this.handleChange}
                                /> Post anonymously (may take 48 hours to approve)
                            </label>
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

    private handleChange(event: React.FormEvent<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>): void {
        const { name, value } = event.currentTarget;
        if (name === 'isAnonymous') {
            const checked = (event.currentTarget as HTMLInputElement).checked;
            this.setState((prevState) => ({ ...prevState, [name]: checked }));
        } else {
            this.setState((prevState) => ({ ...prevState, [name]: value }));
        }
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
