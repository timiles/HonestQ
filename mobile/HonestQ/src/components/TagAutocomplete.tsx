import React from 'react';
import { FlatList, View } from 'react-native';
import { connect } from 'react-redux';
import { HQLabel, HQNavigationButton, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import { TagValueModel } from '../server-models';
import { ApplicationState } from '../store';
import * as TagAutocompleteStore from '../store/TagAutocomplete';

interface OwnProps {
  selectedTags: TagValueModel[];
  onChange: (selectedTags: TagValueModel[]) => void;
}
type TagAutocompleteProps = TagAutocompleteStore.TagAutocompleteState
  & typeof TagAutocompleteStore.actionCreators
  & OwnProps;

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

    this.handleQueryInputChange = this.handleQueryInputChange.bind(this);
  }

  public render() {
    const { suggestions, loading, error } = this.props;
    const { query, selectedTags } = this.state;
    const selectedSlugs = selectedTags.map((x) => x.slug);
    let newSuggestedTags: TagValueModel[] | null = null;
    if (suggestions) {
      newSuggestedTags = suggestions.filter((x) => selectedSlugs.indexOf(x.slug) < 0);
    }

    return (
      <>
        {selectedTags.length > 0 &&
          <FlatList
            style={hqStyles.pv1}
            horizontal={true}
            data={selectedTags}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <HQNavigationButton
                onPress={() => this.removeTag(item)}
              >
                <HQText>－ {item.name}</HQText>
              </HQNavigationButton>
            )}
            ItemSeparatorComponent={() => <View style={hqStyles.ml1} />}
          />
        }
        <HQTextInput
          onChangeText={this.handleQueryInputChange}
          placeholder="Start typing to search for more tags..."
          value={query}
        />
        {newSuggestedTags && newSuggestedTags.length > 0 &&
          <FlatList
            style={hqStyles.pv1}
            horizontal={true}
            data={newSuggestedTags}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <HQNavigationButton
                onPress={() => this.addTag(item)}
              >
                <HQText>＋ {item.name}</HQText>
              </HQNavigationButton>
            )}
            ItemSeparatorComponent={() => <View style={hqStyles.ml1} />}
          />
        }
        {!loading && !error && query.length > 0 && newSuggestedTags && newSuggestedTags.length === 0 &&
          <HQLabel>No suggestions</HQLabel>
        }
        {error &&
          <HQLabel>{error}</HQLabel>
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

  private handleQueryInputChange(text: string): void {
    this.setState({ query: text },
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

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps) => (state.tagAutocomplete);
export default connect(mapStateToProps, TagAutocompleteStore.actionCreators)(TagAutocomplete);
