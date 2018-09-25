import * as React from 'react';

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

        ['Agree', 'Neutral', 'Disagree'].forEach((x) => {
            this.values.set(x, <span className={`agreement-rating agreement-rating-${x.toLowerCase()}`} />);
        });

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const { name } = this.props;
        const { value } = this.state;
        return (
            <div className="btn-group" role="group">
                {Array.from(this.values.keys()).map((key: string, i: number) =>
                    <button
                        key={`rating_${i}`}
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
