import * as React from 'react';
import Emoji, { EmojiValue } from '../shared/Emoji';

export enum OrderByValue {
    Newest,
    Upvotes,
    Comments,
}

interface Props {
    value: OrderByValue;
    onChange: (value: OrderByValue) => void;
}

interface State {
    value: OrderByValue;
}

export default class OrderByControl extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value };

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const currentValue = this.state.value;

        const renderButton = (value: OrderByValue, emojiValue: EmojiValue) => (
            <button
                type="button"
                className={`btn btn-sm btn-outline-secondary ${value === currentValue ? 'active' : ''}`}
                value={OrderByValue[value]}
                onClick={this.handleChange}
            >
                <Emoji value={emojiValue} />
                <span className="ml-1">
                    {OrderByValue[value]}
                </span>
            </button>
        );

        return (
            <div className="btn-group" role="group">
                {renderButton(OrderByValue.Newest, EmojiValue.Recent)}
                {renderButton(OrderByValue.Upvotes, EmojiValue.Upvote)}
                {renderButton(OrderByValue.Comments, EmojiValue.Discuss)}
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        const newValue = OrderByValue[event.currentTarget.value as keyof typeof OrderByValue];
        this.setState({ value: newValue });
        this.props.onChange(newValue);
    }
}
