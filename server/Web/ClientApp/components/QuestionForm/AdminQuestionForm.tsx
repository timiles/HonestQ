import React from 'react';
import { AdminQuestionFormModel, TagValueModel } from '../../server-models';
import { onCtrlEnter } from '../../utils/html-utils';
import { FormProps } from '../shared/FormProps';
import SubmitButton from '../shared/SubmitButton';
import SuperTextArea from '../shared/SuperTextArea';
import TagAutocomplete from '../Tag/TagAutocomplete';

type Props = FormProps<AdminQuestionFormModel>;

export default class AdminQuestionForm extends React.Component<Props, AdminQuestionFormModel> {

  private readonly questionTextInputRef: React.RefObject<SuperTextArea>;

  constructor(props: Props) {
    super(props);

    this.state = (props.initialState) ?
      {
        text: props.initialState.text,
        context: props.initialState.context,
        tags: props.initialState.tags,
        isApproved: props.initialState.isApproved,
      } :
      { text: '', context: '', tags: [], isApproved: false };

    this.questionTextInputRef = React.createRef<SuperTextArea>();

    this.handleChange = this.handleChange.bind(this);
    this.handleTagsChange = this.handleTagsChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidMount() {
    this.questionTextInputRef.current!.focus();
    onCtrlEnter('form', () => this.submit());
  }

  public render() {
    const { error, submitting, submitted } = this.props;
    const { text, context, tags, isApproved } = this.state;

    return (
      <form className="form" autoComplete="off" noValidate={true} onSubmit={this.handleSubmit}>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <div className="form-group">
          <label htmlFor="questionText">Question</label>
          <SuperTextArea
            id="questionText"
            ref={this.questionTextInputRef}
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
          <label htmlFor="questionContext">Context (optional)</label>
          <input
            type="text"
            className="form-control"
            id="questionContext"
            name="context"
            value={context}
            maxLength={2000}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <label>Tags (optional)</label>
          <div>
            <TagAutocomplete
              name="tagSlugs"
              selectedTags={tags}
              onChange={this.handleTagsChange}
            />
          </div>
        </div>
        <div className="form-group form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="isApproved"
            name="isApproved"
            checked={isApproved}
            onChange={this.handleChange}
          />
          <label className="form-check-label" htmlFor="isApproved">Mark as Approved</label>
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    );
  }

  private handleChange(event: React.FormEvent<HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement>): void {
    const { name } = event.currentTarget;
    if (event.currentTarget instanceof HTMLInputElement && event.currentTarget.type === 'checkbox') {
      const { checked } = event.currentTarget;
      this.setState((prevState) => ({ ...prevState, [name]: checked }));
    } else {
      const { value } = event.currentTarget;
      this.setState((prevState) => ({ ...prevState, [name]: value }));
    }
  }

  private handleTagsChange(selectedTags: TagValueModel[]): void {
    this.setState({ tags: selectedTags });
  }

  private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    this.submit();
  }

  private submit(): void {
    this.props.submit!(this.state);
  }
}
