import * as React from 'react';
import QuestionSearchResults from './QuestionSearchResults';

interface State {
    query: string;
}

export default class QuestionSearchControl extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = { query: '' };

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const { query } = this.state;

        return (
            <>
                <input
                    className="form-control mb-1"
                    onChange={this.handleChange}
                    placeholder="Enter keywords..."
                    value={query}
                />
                <QuestionSearchResults
                    containerClassName="mt-2"
                    query={query}
                />
            </>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        this.setState({ query: event.currentTarget.value });
    }
}
