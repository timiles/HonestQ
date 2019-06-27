import React from 'react';
import { FlatList, NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import MoreInfoCard from '../components/MoreInfoCard';
import QuestionCard from '../components/QuestionCard';
import { HQContentView, HQLabel, HQText } from '../hq-components';
import { ApplicationState } from '../store';
import * as TagStore from '../store/Tag';
import { getItemCountText, parseDateWithTimeZoneOffset } from '../utils/string-utils';

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
        <MoreInfoCard description={description} moreInfoUrl={moreInfoUrl} />
        {questions.length === 0 &&
          <HQLabel>Start the conversation</HQLabel>
        }
        <FlatList
          data={orderedQuestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <QuestionCard question={item} navigation={this.props.navigation} />
          )}
        />
      </HQContentView>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => (state.tag);
export default connect(mapStateToProps, TagStore.actionCreators)(TagScreen);
