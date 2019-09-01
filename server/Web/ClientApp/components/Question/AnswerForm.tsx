import React from 'react';
import { AnswerFormModel } from '../../server-models';
import { enableConfirmOnLeave, onCtrlEnter } from '../../utils/html-utils';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';

type Props = FormProps<AnswerFormModel>
  & AnswerFormProps;

interface AnswerFormProps {
  isModal?: boolean;
  onCloseModalRequested?: () => void;
}

export default class AnswerForm extends React.Component<Props, AnswerFormModel> {

  private readonly answerTextInputRef: React.RefObject<SuperTextArea>;
  constructor(props: Props) {
    super(props);

    this.state = (props.initialState) ?
      {
        text: props.initialState.text,
      } :
      { text: '' };

    this.answerTextInputRef = React.createRef<SuperTextArea>();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidMount() {
    this.answerTextInputRef.current!.focus();
    onCtrlEnter('form', () => this.submit());
  }

  public componentDidUpdate() {
    enableConfirmOnLeave(this.shouldConfirmOnLeave());
  }

  public componentWillUnmount() {
    enableConfirmOnLeave(false);
  }

  public render() {
    const { isModal, onCloseModalRequested, submitting, submitted, error } = this.props;
    const { text } = this.state;

    return (
      <form name="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
        <div className={isModal ? 'modal-body' : ''}>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="form-group">
            <label htmlFor="answerText">
              Provide a short summary of your answer
            </label>
            <label id="textHelpBlock" className="form-text small text-muted mb-2">
              You can back up your answer with specific details and sources in the Comments section.
            </label>
            <SuperTextArea
              id="answerText"
              ref={this.answerTextInputRef}
              name="text"
              className="form-control"
              maxLength={280}
              required={true}
              submitted={submitted}
              value={text}
              onChange={this.handleChange}
              aria-describedby="textHelpBlock"
            />
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
    this.submit();
  }

  private submit(): void {
    this.props.submit!(this.state);
  }

  private shouldConfirmOnLeave(): boolean {
    const { text } = this.state;
    return (!!text);
  }
}
