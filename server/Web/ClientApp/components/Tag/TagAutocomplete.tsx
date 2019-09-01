import React from 'react';
import { connect } from 'react-redux';
import { TagValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TagAutocompleteStore from '../../store/TagAutocomplete';

// REVIEW: Is there a more performant way to pass suggestions to add/remove methods?
// tslint:disable:jsx-no-lambda

type TagAutocompleteProps = TagAutocompleteStore.TagAutocompleteState
  & typeof TagAutocompleteStore.actionCreators
  & {
    name?: string,
    selectedTags: TagValueModel[],
    onChange: (selectedTags: TagValueModel[]) => void,
  };

interface State {
  query: string;
  selectedTags: TagValueModel[];
}

class TagAutocomplete extends React.Component<TagAutocompleteProps, State> {

  private readonly inputDelayMilliseconds = 500;
  private waitForInputTimeoutId: number | null = null;

  constructor(props: TagAutocompleteProps) {
    super(props);

    this.state = { query: props.query, selectedTags: props.selectedTags };

    this.handleChange = this.handleChange.bind(this);
  }

  public render() {
    const { name, suggestions, loading, error } = this.props;
    const { query, selectedTags } = this.state;
    const selectedSlugs = selectedTags.map((x) => x.slug);
    let newSuggestedTags: TagValueModel[] | null = null;
    if (suggestions) {
      newSuggestedTags = suggestions.filter((x) => selectedSlugs.indexOf(x.slug) < 0);
    }

    return (
      <>
        {selectedTags.length > 0 &&
          <ul className="list-inline">
            {selectedTags.map((x: TagValueModel, i: number) =>
              <li key={i} className="mb-1 list-inline-item">
                <div className="btn-group mr-1" role="group">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => this.removeTag(x)}
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
          placeholder="Start typing to search for more tags..."
          value={query}
        />
        {newSuggestedTags && newSuggestedTags.length > 0 &&
          <ul className="list-unstyled mt-1">
            {newSuggestedTags.map((x: TagValueModel, i: number) =>
              <li
                key={i}
                className="btn btn-sm btn-outline-secondary mr-1 mt-1"
                onClick={() => this.addTag(x)}
              >
                ＋ {x.name}
              </li>)}
          </ul>
        }
        {!loading && !error && query.length > 0 && newSuggestedTags && newSuggestedTags.length === 0 &&
          <i>No suggestions</i>
        }
        {error &&
          <i>{error}</i>
        }
      </>
    );
  }

  private addTag(value: TagValueModel): void {
    this.setState((prevState) => {
      // Check we don't have this Tag already. (Might be possible under race conditions)
      if (prevState.selectedTags.filter((x) => x.slug === value.slug).length === 0) {
        return { ...prevState, selectedTags: prevState.selectedTags.concat({ ...value }) };
      }
      return prevState;
    },
      () => this.props.onChange(this.state.selectedTags));
  }

  private removeTag(value: TagValueModel): void {
    this.setState((prevState) => {
      const indexOfTagToRemove = prevState.selectedTags.indexOf(value);
      if (indexOfTagToRemove >= 0) {
        prevState.selectedTags.splice(indexOfTagToRemove, 1);
        return { ...prevState, selectedTags: prevState.selectedTags };
      }
      return prevState;
    },
      () => this.props.onChange(this.state.selectedTags));
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
          this.props.autocompleteTags(q);
        }, delay, this.state.query);
      });
  }
}

export default connect(
  (state: ApplicationState, ownProps: any) => (state.tagAutocomplete),
  TagAutocompleteStore.actionCreators,
)(TagAutocomplete);
