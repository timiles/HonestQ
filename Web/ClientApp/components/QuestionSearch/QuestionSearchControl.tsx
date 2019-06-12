import React from 'react';
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
            <div className="question-search-control">
                <input
                    className="form-control mb-1"
                    onChange={this.handleChange}
                    placeholder="Search Questions by keywords..."
                    value={query}
                />
                <div className="search-icon" />
                <QuestionSearchResults
                    containerClassName="mt-2 p-2 position-absolute w-100 rounded shadow-lg"
                    query={query}
                />
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        this.setState({ query: event.currentTarget.value });
    }
}
