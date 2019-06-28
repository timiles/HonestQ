import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import AnswerCard from '../components/AnswerCard';
import CircleIconCard from '../components/CircleIconCard';
import { InfoCard } from '../components/InfoCard';
import TextWithShortLinks from '../components/TextWithShortLinks';
import { HQContentView, HQHeader, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
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
        <FlatList
          ListHeaderComponent={(
            <View style={hqStyles.mh1}>
              <CircleIconCard type="Q" style={hqStyles.mb1}>
                <HQHeader>{text}</HQHeader>
              </CircleIconCard>
              {context &&
                <InfoCard style={hqStyles.mb1}>
                  <HQHeader>Context</HQHeader>
                  <TextWithShortLinks value={context} />
                </InfoCard>
              }
              <View style={hqStyles.mb1}>
                <HQHeader>Tags</HQHeader>
                <FlatList
                  data={tags}
                  keyExtractor={(item) => item.slug}
                  renderItem={({ item }) => (
                    <HQText>{item.name}</HQText>
                  )}
                />
              </View>
              <HQHeader>{answersCountText}</HQHeader>
            </View>
          )}
          data={answers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[hqStyles.mb1, hqStyles.mh1]}>
              <AnswerCard answer={item} navigation={this.props.navigation} />
            </View>
          )}
        />
      </HQContentView>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(QuestionScreen);
