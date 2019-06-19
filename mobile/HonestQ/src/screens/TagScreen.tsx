import React from 'react';
import { Button, Text, View } from 'react-native';
import { FlatList, NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as TagStore from '../store/Tag';
import { getItemCountText, parseDateWithTimeZoneOffset } from '../utils/string-utils';
import { QuestionNavigationProps } from './QuestionScreen';

export interface TagNavigationProps {
  tagSlug: string;
}

interface NavProps {
  navigation: NavigationScreenProp<{}, TagNavigationProps>;
}

type Props = TagStore.TagState
  & typeof TagStore.actionCreators
  & NavProps;

class TagScreen extends React.Component<Props> {

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
      return <Text>Loading</Text>;
    }

    const { name, description, moreInfoUrl, questions } = tag;

    const orderedQuestions = questions.sort((a, b) =>
      parseDateWithTimeZoneOffset(b.mostRecentActivityPostedAt).getTime() -
      parseDateWithTimeZoneOffset(a.mostRecentActivityPostedAt).getTime());

    const questionsCountText = getItemCountText('Question', questions.length);

    return (
      <View>
        <Text>{name}</Text>
        <Text>{questionsCountText}</Text>
        <Text>Description</Text>
        <Text>{description}</Text>
        <Text>More info</Text>
        <Text>{moreInfoUrl}</Text>
        {questions.length === 0 &&
          <Text>Start the conversation</Text>
        }
        <FlatList
          data={orderedQuestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <Text>{item.text}</Text>
              <Button
                title={getItemCountText('Answer', item.answersCount)}
                onPress={() => this.navigateToQuestion(item.id)}
              />
            </>
          )}
        />
      </View>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    this.props.navigation.navigate('Question', navProps);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.tag);
export default connect(mapStateToProps, TagStore.actionCreators)(TagScreen);
