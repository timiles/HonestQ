import React from 'react';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { CommentFormModel } from '../../server-models';
import { enableConfirmOnLeave, onCtrlEnter } from '../../utils/html-utils';
import AgreementRatingLabel from '../shared/AgreementRatingLabel';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

type Props = FormProps<CommentFormModel>
    & CommentFormProps;

interface CommentFormProps {
    agreementRating: string;
    onCancel?: () => void;
    parentCommentId?: number;
}

export default class CommentForm extends React.Component<Props, CommentFormModel> {

    private readonly commentTextInputRef: React.RefObject<SuperTextArea>;
    private readonly containerDivRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.state = (props.initialState) ? props.initialState
            : {
                text: '',
                source: '',
                agreementRating: this.props.agreementRating,
                parentCommentId: this.props.parentCommentId,
                isAnonymous: false,
            };

        this.commentTextInputRef = React.createRef<SuperTextArea>();
        this.containerDivRef = React.createRef<HTMLDivElement>();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        // Allow the .slide-down animation to finish
        setTimeout(() => {
            this.commentTextInputRef.current!.focus();
            // Undo the max-height used for the animation
            this.containerDivRef.current!.classList.remove('slide-down');
        }, 500);
        onCtrlEnter('form', () => this.submit());
    }

    public componentWillUnmount() {
        enableConfirmOnLeave(false);
    }

    public componentDidUpdate(prevProps: Props) {
        enableConfirmOnLeave(this.shouldConfirmOnLeave());
        if (prevProps.agreementRating !== this.props.agreementRating) {
            this.setState({ agreementRating: this.props.agreementRating });
        }
    }

    public render() {
        const { onCancel, submitting, submitted, error } = this.props;
        const { text, source, agreementRating } = this.state;

        return (
            <div className="card light-dark-bg slide-down" ref={this.containerDivRef}>
                <div className="card-body">
                    <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        <div className="form-group">
                            <AgreementRatingLabel value={agreementRating} />
                            <LoggedInUserContext.Consumer>
                                {(user) => user && <span className="ml-2">{user.username}</span>}
                            </LoggedInUserContext.Consumer>
                        </div>
                        <div className="form-group">
                            <label htmlFor="commentText">Comment</label>
                            <SuperTextArea
                                id="commentText"
                                ref={this.commentTextInputRef}
                                name="text"
                                className="form-control"
                                maxLength={280}
                                required={true}
                                submitted={submitted}
                                value={text}
                                onChange={this.handleChange}
                            />
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
                        {/* <div className="form-group">
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
                            </div> */}
                        <div className="form-group">
                            <div className="float-right">
                                {onCancel &&
                                    <button
                                        type="button"
                                        className="btn btn-secondary mr-2"
                                        onClick={onCancel}
                                    >
                                        Cancel
                                    </button>}
                                <SubmitButton submitting={submitting} />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
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
        this.submit();
    }

    private submit(): void {
        this.props.submit!(this.state);
    }

    private shouldConfirmOnLeave(): boolean {
        const { text, source } = this.state;
        return (!!text || !!source);
    }
}
