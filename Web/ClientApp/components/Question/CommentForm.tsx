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
        const { text, source, agreementRating } = this.state;

        return (
            <form name="form" autoComplete="off" onSubmit={this.handleSubmit}>
                <div className={isModal ? 'modal-body' : ''}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
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
                        {submitted && !text && !source &&
                            <div className="help-block">Text or Source is required</div>
                        }
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
        this.setState((prevState) => ({ ...prevState, [name]: value }));
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.props.submit!(this.state);
    }
}
