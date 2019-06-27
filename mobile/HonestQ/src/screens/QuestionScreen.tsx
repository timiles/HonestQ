import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import AnswerCard from '../components/AnswerCard';
import TextWithShortLinks from '../components/TextWithShortLinks';
import { HQContentView, HQHeader, HQInfoCard, HQText } from '../hq-components';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import { getItemCountText } from '../utils/string-utils';

export interface QuestionNavigationProps {
  questionId: number;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavigationScreenProps<QuestionNavigationProps>;

class QuestionScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Question',
  };

  public constructor(props: Props) {
    super(props);

    const { questionId } = this.props.navigation.state.params;
    if (!props.question || props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }
  }

  public render() {
    const { question } = this.props;
    const { questionId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      return <HQContentView><HQText>Loading</HQText></HQContentView>;
    }

    const { text, context, tags, answers } = question;
    const answersCountText = getItemCountText('Answer', answers.length);

    return (
      <HQContentView>
        <View style={styles.itemContainerStyle}>
          <HQHeader>{text}</HQHeader>
        </View>
        <FlatList
          ListHeaderComponent={(
            <View style={styles.itemContainerStyle}>
              {context &&
                <HQInfoCard>
                  <HQHeader>Context</HQHeader>
                  <TextWithShortLinks value={context} />
                </HQInfoCard>
              }
              <HQHeader>Tags</HQHeader>
              <FlatList
                data={tags}
                keyExtractor={(item) => item.slug}
                renderItem={({ item }) => (
                  <HQText>{item.name}</HQText>
                )}
              />
              <View style={{ marginTop: 10 }}>
                <HQHeader>{answersCountText}</HQHeader>
              </View>
            </View>
          )}
          data={answers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainerStyle}>
              <AnswerCard answer={item} navigation={this.props.navigation} />
            </View>
          )}
        />
      </HQContentView>
    );
  }
}

const itemContainerStyle: StyleProp<ViewStyle> = {
  margin: 10,
};
const styles = StyleSheet.create({ itemContainerStyle });

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(QuestionScreen);
