import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FlatList, NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import QuestionCard from '../components/QuestionCard';
import TextWithShortLinks from '../components/TextWithShortLinks';
import { HQContentView, HQHeader, HQInfoCard, HQLabel, HQText } from '../hq-components';
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

    const { description, moreInfoUrl, questions } = tag;

    const orderedQuestions = questions.sort((a, b) =>
      parseDateWithTimeZoneOffset(b.mostRecentActivityPostedAt).getTime() -
      parseDateWithTimeZoneOffset(a.mostRecentActivityPostedAt).getTime());

    const questionsCountText = getItemCountText('Question', questions.length);

    return (
      <HQContentView>
        <FlatList
          ListHeaderComponent={
            <View style={styles.itemContainerStyle}>
              {(description || moreInfoUrl) ?
                <HQInfoCard>
                  {description ?
                    <>
                      <HQHeader>Description</HQHeader>
                      <TextWithShortLinks value={description} />
                    </>
                    : null
                  }
                  {(description && moreInfoUrl) ?
                    <View style={{ height: 10 }} />
                    : null
                  }
                  {moreInfoUrl ?
                    <>
                      <HQHeader>More info</HQHeader>
                      <TextWithShortLinks value={moreInfoUrl} />
                    </>
                    : null}
                </HQInfoCard>
                : null
              }
              <View style={{ marginTop: 10 }}>
                <HQHeader>{questionsCountText}</HQHeader>
                {questions.length === 0 &&
                  <HQLabel>Start the conversation</HQLabel>
                }
              </View>
            </View>
          }
          data={orderedQuestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainerStyle}>
              <QuestionCard question={item} navigation={this.props.navigation} />
            </View>
          )}
        />
      </HQContentView>
    );
  }
}

const itemContainerStyle: StyleProp<ViewStyle> = {
  margin: 10,
  marginTop: 0,
};
const styles = StyleSheet.create({ itemContainerStyle });

const mapStateToProps = (state: ApplicationState) => (state.tag);
export default connect(mapStateToProps, TagStore.actionCreators)(TagScreen);
