import React from 'react';
import { Button } from 'react-native';
import { FlatList, NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import { HQContentView, HQText } from '../hq-components';
import { ApplicationState } from '../store';
import * as TagStore from '../store/Tag';
import { getItemCountText, parseDateWithTimeZoneOffset } from '../utils/string-utils';
import { QuestionNavigationProps } from './QuestionScreen';

export interface TagNavigationProps {
  tagSlug: string;
  tagName: string;
}

type Props = TagStore.TagState
  & typeof TagStore.actionCreators
  & NavigationScreenProps<TagNavigationProps>;

class TagScreen extends React.Component<Props> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps<TagNavigationProps>): NavigationScreenOptions => {
      return {
        title: navigation.getParam('tagName'),
      };
    }

  public constructor(props: Props) {
    super(props);

    const { tagSlug } = this.props.navigation.state.params;
    if (!props.tag || props.tag.slug !== tagSlug) {
      props.getTag(tagSlug);
    }
  }

  public render() {
    const { tag } = this.props;
    const { tagSlug } = this.props.navigation.state.params;

    if (!tag || tag.slug !== tagSlug) {
      return <HQContentView><HQText>Loading</HQText></HQContentView>;
    }

    const { name, description, moreInfoUrl, questions } = tag;

    const orderedQuestions = questions.sort((a, b) =>
      parseDateWithTimeZoneOffset(b.mostRecentActivityPostedAt).getTime() -
      parseDateWithTimeZoneOffset(a.mostRecentActivityPostedAt).getTime());

    const questionsCountText = getItemCountText('Question', questions.length);

    return (
      <HQContentView>
        <HQText>{name}</HQText>
        <HQText>{questionsCountText}</HQText>
        <HQText>Description</HQText>
        <HQText>{description}</HQText>
        <HQText>More info</HQText>
        <HQText>{moreInfoUrl}</HQText>
        {questions.length === 0 &&
          <HQText>Start the conversation</HQText>
        }
        <FlatList
          data={orderedQuestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <HQText>{item.text}</HQText>
              <Button
                title={getItemCountText('Answer', item.answersCount)}
                onPress={() => this.navigateToQuestion(item.id)}
              />
            </>
          )}
        />
      </HQContentView>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    this.props.navigation.navigate('Question', navProps);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.tag);
export default connect(mapStateToProps, TagStore.actionCreators)(TagScreen);
