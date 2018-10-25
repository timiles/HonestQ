import * as React from 'react';

interface Props {
    id?: string;
    name?: string;
    className?: string;
    value?: string;
    maxLength: number;
    onChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

interface State {
    value?: string;
    scrollHeight: number;
    focused: boolean;
}

export default class SuperTextArea extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { value: props.value, scrollHeight: 0, focused: false };

        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        this.setState({ value: nextProps.value || '' });
        if (!nextProps.value) {
            this.setState({ scrollHeight: 0 });
        }
    }

    public render() {
        const { id, name, className, maxLength } = this.props;
        const { value, scrollHeight, focused } = this.state;
        const remainingCharacterCount = maxLength - (value ? value.length : 0);
        // Use rows to specify a minimum, then the min-height CSS will override it as the text grows
        const rowCount = (value || focused) ? 3 : 1;
        const minHeight = `${scrollHeight + 2}px`; // Add a pixel either side
        return (
            <>
                <textarea
                    id={id}
                    name={name}
                    className={className}
                    style={{ minHeight }}
                    rows={rowCount}
                    maxLength={maxLength}
                    value={value}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                />
                <div className="float-right">{remainingCharacterCount} characters remaining</div>
                <br className="clear" />
            </>
        );
    }

    private handleChange(event: React.FormEvent<HTMLTextAreaElement>): void {
        this.setState({ value: event.currentTarget.value, scrollHeight: event.currentTarget.scrollHeight });
        this.props.onChange(event);
    }

    private handleFocus(event: React.FormEvent<HTMLTextAreaElement>): void {
        this.setState({ focused: true, scrollHeight: event.currentTarget.scrollHeight });
    }

    private handleBlur(event: React.FormEvent<HTMLTextAreaElement>): void {
        this.setState({ focused: false });
    }
}
