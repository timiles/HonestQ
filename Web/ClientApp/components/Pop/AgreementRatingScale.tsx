import * as React from 'react';

interface Props {
    name?: string;
    value: string;
    onChange: (name: string, text: string) => void;
}

interface State {
    value: string;
}

export default class AgreementRatingScale extends React.Component<Props, State> {

    private readonly agreementRatingValues = ['StronglyDisagree', 'Disagree', 'Neutral', 'Agree', 'StronglyAgree'];

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value };

        this.handleChange = this.handleChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        this.setState({ value: nextProps.value });
    }

    public render() {
        const { name } = this.props;
        const { value } = this.state;
        return (
            <ul className="rating-scale">
                {this.agreementRatingValues.map((x: string, i: number) =>
                    <li key={`agreementRating${i}`}>
                        <label>
                            <input
                                type="radio"
                                name={name}
                                value={x}
                                onChange={this.handleChange}
                                checked={value === x}
                            />
                            {x.toSentenceCase()}
                        </label>
                    </li>)
                }
            </ul>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        this.setState({ value: event.currentTarget.value });
        this.props.onChange(event.currentTarget.name, event.currentTarget.value);
    }
}
