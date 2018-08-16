import * as React from 'react';
import PopTypeView from '../shared/PopTypeView';

interface Props {
    name?: string;
    value?: string;
    includeAll?: boolean;
    onChange: (event: React.FormEvent<HTMLButtonElement>) => void;
}

interface State {
    value: string;
}

export default class PopTypeInput extends React.Component<Props, State> {

    private readonly values = new Map();

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value || '' };

        if (this.props.includeAll) {
            this.values.set('', 'All');
        }
        ['Statement', 'RequestForProof', 'Question'].forEach((x) => {
            this.values.set(x, <PopTypeView value={x} />);
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
                        key={`type${i}`}
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
