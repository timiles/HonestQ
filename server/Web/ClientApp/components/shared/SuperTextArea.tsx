import React from 'react';

interface Props {
  id?: string;
  name: string;
  className?: string;
  required?: boolean;
  submitted?: boolean;
  value?: string;
  maxLength: number;
  onChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

interface State {
  scrollHeight: number;
  focused: boolean;
}

export default class SuperTextArea extends React.Component<Props, State> {

  private cursorPosition: number = 0;
  private readonly textAreaRef: React.RefObject<HTMLTextAreaElement>;

  constructor(props: Props) {
    super(props);

    this.state = { scrollHeight: 0, focused: false };

    this.textAreaRef = React.createRef<HTMLTextAreaElement>();

    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    // IE will re-focus the element, so only do this if we actually want to have focus already.
    if (this.state.focused) {
      this.textAreaRef.current!.selectionStart = this.cursorPosition;
      this.textAreaRef.current!.selectionEnd = this.cursorPosition;
    }

    if (prevProps.value && !this.props.value) {
      this.setState({ scrollHeight: 0 });
    }
  }

  public focus() {
    this.textAreaRef.current!.focus();
  }

  public render() {
    const { id, name, className, maxLength, required, value, submitted } = this.props;
    const { scrollHeight } = this.state;
    const remainingCharacterCount = maxLength - (value ? value.length : 0);

    // Always show exceeded character count error even if not submitted.
    let invalidClass = '';
    let remainingCharacterCountClass = '';
    if (remainingCharacterCount < 0) {
      invalidClass = 'is-invalid';
      remainingCharacterCountClass = 'text-danger';
    } else if (submitted) {
      invalidClass = (required && !value) ? 'is-invalid' : 'is-valid';
      remainingCharacterCountClass = value ? 'text-success' : '';
    }

    // Use rows to specify a minimum, then the min-height CSS will override it as the text grows
    const minimumNumberOfRows = 3;
    return (
      <>
        <textarea
          id={id}
          ref={this.textAreaRef}
          name={name}
          className={`${className} ${invalidClass}`}
          style={{ minHeight: `${scrollHeight}px`, overflow: 'hidden' }}
          rows={minimumNumberOfRows}
          value={value}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
        <div className={`float-right ${remainingCharacterCountClass}`}>
          <label>
            {remainingCharacterCount} characters remaining
                    </label>
        </div>
        {required && !value &&
          <div className="invalid-feedback">{name.toSentenceCase(true)} is required</div>
        }
        <br className="clear" />
      </>
    );
  }

  private handleChange(event: React.FormEvent<HTMLTextAreaElement>): void {
    this.cursorPosition = event.currentTarget.selectionEnd;

    // If we've just typed three dots, turn into ellipsis to save characters
    if (event.currentTarget.value.substr(this.cursorPosition - 3, 3) === '...') {
      this.cursorPosition -= 2;
      event.currentTarget.value = event.currentTarget.value.replace('...', '???');
    }

    const { scrollHeight } = event.currentTarget;
    this.setState((prevState) => ({
      ...prevState,
      scrollHeight: Math.max(prevState.scrollHeight, scrollHeight),
    }));
    this.props.onChange(event);
  }

  private handleFocus(event: React.FormEvent<HTMLTextAreaElement>): void {
    this.setState({ focused: true, scrollHeight: event.currentTarget.scrollHeight });
  }

  private handleBlur(event: React.FormEvent<HTMLTextAreaElement>): void {
    this.cursorPosition = event.currentTarget.selectionEnd;
    this.setState({ focused: false });
  }
}
