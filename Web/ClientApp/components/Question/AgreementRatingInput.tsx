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

    private readonly values = new Array<string>();

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value || '' };

        this.values = ['Agree', 'Neutral', 'Disagree'];

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const { name } = this.props;
        const { value } = this.state;
        return (
            <div className="btn-group" role="group">
                {this.values.map((x: string, i: number) =>
                    <button
                        key={i}
                        type="button"
                        className={`btn btn-outline-secondary ${x === value ? 'active' : ''}`}
                        value={x}
                        name={name}
                        onClick={this.handleChange}
                    >
                        <Emoji value={EmojiValue[x as keyof typeof EmojiValue]} />
                        <span className="ml-1">
                            {x}
                        </span>
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
