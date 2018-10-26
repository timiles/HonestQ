import * as React from 'react';
import Emoji, { EmojiValue } from '../shared/Emoji';

interface Props {
    name?: string;
    value: string;
    onChange: (event: React.FormEvent<HTMLButtonElement>) => void;
}

interface State {
    value: string;
}

export default class AgreementRatingInput extends React.Component<Props, State> {

    private readonly values = new Map();

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value || '' };

        this.values.set('Agree', <Emoji value={EmojiValue.Agree} />);
        this.values.set('Neutral', <Emoji value={EmojiValue.Neutral} />);
        this.values.set('Disagree', <Emoji value={EmojiValue.Disagree} />);

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const { name } = this.props;
        const { value } = this.state;
        return (
            <div className="btn-group" role="group">
                {Array.from(this.values.keys()).map((key: string, i: number) =>
                    <button
                        key={i}
                        type="button"
                        className={`btn btn-outline-secondary ${key === value ? 'active' : ''}`}
                        value={key}
                        name={name}
                        onClick={this.handleChange}
                    >
                        {this.values.get(key)}
                    </button>)
                }
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ value: event.currentTarget.value });
        this.props.onChange(event);
    }
}
