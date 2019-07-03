import React from 'react';
import { connect } from 'react-redux';
import { HQContentView, HQHeader, HQSubmitButton, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import { TagFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewTagStore from '../store/NewTag';

type Props = NewTagStore.NewTagState
  & typeof NewTagStore.actionCreators;

class NewTagScreen extends React.Component<Props, TagFormModel> {

  constructor(props: Props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      moreInfoUrl: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.submitted && !this.props.submitted) {
      // Reset the form when a tag has been successfully submitted
      this.setState({
        name: '',
        description: '',
        moreInfoUrl: '',
      });
    }
  }

  public render() {
    const { name, description, moreInfoUrl } = this.state;
    const { submitting, submitted, error } = this.props;
    const previous = this.props.previouslySubmittedTagFormModel;
    return (
      <HQContentView style={hqStyles.p1}>
        <HQHeader style={hqStyles.mb1}>Suggest a new tag</HQHeader>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        {previous && (
          <HQText>
            Your tag "{previous.name}" has been created and is awaiting approval!
          </HQText>
        )}
        <HQTextInput
          containerStyle={hqStyles.mb1}
          autoFocus={true}
          placeholder="Tag name"
          maxLength={100}
          value={name}
          onChangeText={(text) => this.setState({ name: text })}
          submitted={submitted && !error}
          error={!name ? 'Tag name is required' : null}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          placeholder="Description (optional)"
          maxLength={280}
          value={description}
          onChangeText={(text) => this.setState({ description: text })}
          submitted={submitted && !error}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          placeholder="Link to more info, e.g. a Wikipedia page (optional)"
          maxLength={2000}
          value={moreInfoUrl}
          onChangeText={(text) => this.setState({ moreInfoUrl: text })}
          submitted={submitted && !error}
        />
        <HQSubmitButton title="Submit" submitting={submitting} onPress={this.handleSubmit} />
      </HQContentView>
    );
  }

  private handleSubmit(): void {
    this.props.submit(this.state);
  }
}

export default connect((state: ApplicationState) => (state.newTag), NewTagStore.actionCreators)(NewTagScreen);
