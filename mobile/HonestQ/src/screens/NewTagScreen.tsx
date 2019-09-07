import React from 'react';
import { View } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import { HQSubmitButton, HQSuperTextInput, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { TagFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewTagStore from '../store/NewTag';
import ThemeService from '../ThemeService';

type Props = NewTagStore.NewTagState
  & typeof NewTagStore.actionCreators;

class NewTagScreen extends React.Component<Props, TagFormModel> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Suggest a new tag',
  };

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
      NavigationService.goBack();
    }
  }

  public componentWillUnmount() {
    this.props.reset();
  }

  public render() {
    const { name, description, moreInfoUrl } = this.state;
    const { submitting, submitted, error } = this.props;

    return (
      <KeyboardPaddedScrollView style={ThemeService.getStyles().contentView} contentContainerStyle={hqStyles.p1}>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
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
        <HQSuperTextInput
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
        <View style={[hqStyles.rowAlignEnd, hqStyles.mt1]}>
          <HQSubmitButton title="Submit" submitting={submitting} onPress={this.handleSubmit} />
        </View>
      </KeyboardPaddedScrollView>
    );
  }

  private handleSubmit(): void {
    this.props.submit(this.state);
  }
}

export default connect((state: ApplicationState) => (state.newTag), NewTagStore.actionCreators)(NewTagScreen);
