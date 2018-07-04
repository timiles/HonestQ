import * as React from 'react';

interface Props {
    name?: string;
    value?: string;
    includeAll?: boolean;
    onChange: (event: React.FormEvent<HTMLButtonElement>) => void;
}

interface State {
    value: string;
}

export default class StanceInput extends React.Component<Props, State> {

    private readonly stanceValues = new Map();

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value || '' };

        if (this.props.includeAll) {
            this.stanceValues.set('', 'All');
        }
        [['NA', 'N/A'], ['Pro', '👍'], ['Con', '👎']].map((x) => this.stanceValues.set(x[0], x[1]));

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const { name } = this.props;
        const { value } = this.state;
        return (
            <div className="btn-group" role="group">
                {Array.from(this.stanceValues.keys()).map((key: string, i: number) =>
                    <button
                        key={`stance${i}`}
                        type="button"
                        className={`btn btn-outline-secondary ${key === value ? 'active' : ''}`}
                        value={key}
                        name={name}
                        onClick={this.handleChange}
                    >
                        {this.stanceValues.get(key)}
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
