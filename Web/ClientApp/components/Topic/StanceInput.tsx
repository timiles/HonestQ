import * as React from 'react';

interface Props {
    value?: string;
    onChange: (stance: string) => void;
}

interface State {
    value: string;
}

export default class StanceInput extends React.Component<Props, State> {

    private readonly values = ['Neutral', 'Pro', 'Con', 'Caution'];

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value || 'Neutral' };

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const { value } = this.state;
        return (
            <div className="btn-group" role="group">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary dropdown-toggle"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <span className={`stance stance-${value.toLowerCase()}`} />
                </button>
                <div className="dropdown-menu stance-dropdown-menu">
                    {this.values.map((v: string, i: number) =>
                        <button
                            key={`stance${i}`}
                            type="button"
                            className={`stance stance-${v.toLowerCase()} dropdown-item ${v === value ? 'active' : ''}`}
                            value={v}
                            onClick={this.handleChange}
                        >
                            {v}
                        </button>)}
                </div>
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ value: event.currentTarget.value });
        this.props.onChange(event.currentTarget.value);
    }
}
