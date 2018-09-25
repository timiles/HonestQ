import * as React from 'react';
import { connect } from 'react-redux';
import { TopicValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicAutocompleteStore from '../../store/TopicAutocomplete';

// REVIEW: Is there a more performant way to pass suggestions to add/remove methods?
// tslint:disable:jsx-no-lambda

type TopicAutocompleteProps = TopicAutocompleteStore.TopicAutocompleteState
    & typeof TopicAutocompleteStore.actionCreators
    & {
    name?: string,
    selectedTopics: TopicValueModel[],
    onChange: (selectedTopics: TopicValueModel[]) => void,
};

interface State {
    query: string;
    selectedTopics: TopicValueModel[];
    suggestedTopics: TopicValueModel[] | null;
}

class TopicAutocomplete extends React.Component<TopicAutocompleteProps, State> {

    private readonly inputDelayMilliseconds = 500;
    private waitForInputTimeoutId: number | null = null;

    constructor(props: TopicAutocompleteProps) {
        super(props);

        this.state = { query: props.query, selectedTopics: props.selectedTopics, suggestedTopics: props.suggestions };

        this.handleChange = this.handleChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: TopicAutocompleteProps) {
        this.setState({ suggestedTopics: nextProps.suggestions });
    }

    public render() {
        const { name, loading, error } = this.props;
        const { query, selectedTopics, suggestedTopics } = this.state;
        const selectedSlugs = selectedTopics.map((x) => x.slug);
        let newSuggestedTopics: TopicValueModel[] | null = null;
        if (suggestedTopics) {
            newSuggestedTopics = suggestedTopics.filter((x) => selectedSlugs.indexOf(x.slug) < 0);
        }

        return (
            <>
                {selectedTopics.length > 0 &&
                    <ul className="topics-list">
                        {selectedTopics.map((x) =>
                            <li key={`selectedTopic_${x.slug}`} className="mb-1">
                                <div className="btn-group mr-1" role="group">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => this.removeTopic(x)}
                                    >
                                        － {x.name}
                                    </button>
                                </div>
                            </li>)}
                    </ul>
                }
                <input
                    name={name}
                    className="form-control"
                    onChange={this.handleChange}
                    placeholder="Start typing to search for more topics..."
                    value={query}
                />
                {newSuggestedTopics && newSuggestedTopics.length > 0 &&
                    <ul className="list-unstyled mt-1">
                        {newSuggestedTopics.map((x) =>
                            <li
                                key={`suggestedTopic_${x.slug}`}
                                className="btn btn-sm btn-outline-secondary mr-1 mt-1"
                                onClick={() => this.addTopic(x)}
                            >
                                ＋ {x.name}
                            </li>)}
                    </ul>
                }
                {!loading && !error && query.length > 0 && newSuggestedTopics && newSuggestedTopics.length === 0 &&
                    <i>No suggestions</i>
                }
                {error &&
                    <i>{error}</i>
                }
            </>
        );
    }

    private addTopic(value: TopicValueModel): void {
        this.setState((prevState) => {
            // Check we don't have this Topic already. (Might be possible under race conditions)
            if (prevState.selectedTopics.filter((x) => x.slug === value.slug).length === 0) {
                return { ...prevState, selectedTopics: prevState.selectedTopics.concat({ ...value }) };
            }
            return prevState;
        },
            () => this.props.onChange(this.state.selectedTopics));
    }

    private removeTopic(value: TopicValueModel): void {
        this.setState((prevState) => {
            const indexOfTopicToRemove = prevState.selectedTopics.indexOf(value);
            if (indexOfTopicToRemove >= 0) {
                prevState.selectedTopics.splice(indexOfTopicToRemove, 1);
                return { ...prevState, selectedTopics: prevState.selectedTopics };
            }
            return prevState;
        },
            () => this.props.onChange(this.state.selectedTopics));
    }

    private handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const queryInputValue = event.currentTarget.value;
        this.setState({ query: queryInputValue },
            () => {
                // Wait for user to have stopped typing before firing event
                if (this.waitForInputTimeoutId) {
                    clearTimeout(this.waitForInputTimeoutId);
                }
                // If the input box was cleared, update state immediately
                const delay = (!this.state.query) ? 0 : this.inputDelayMilliseconds;
                this.waitForInputTimeoutId = setTimeout((q: string): void => {
                    this.props.autocompleteTopics(q);
                }, delay, this.state.query);
            });
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.topicAutocomplete),
    TopicAutocompleteStore.actionCreators,
)(TopicAutocomplete);
