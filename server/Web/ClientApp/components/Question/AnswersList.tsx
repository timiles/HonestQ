import React from 'react';
import { AnswerModel } from '../../server-models';
import { getCommentScores } from '../../utils/model-utils';
import AnswerSummary from './AnswerSummary';
import NewAnswer from './NewAnswer';

interface Props {
  questionId: number;
  questionSlug: string;
  answers: AnswerModel[];
}

export default class AnswersList extends React.Component<Props> {

  private static getScore(answer: AnswerModel): number {
    const [agreeCount, disagreeCount] = getCommentScores(answer.comments);
    return answer.upvotes + agreeCount - disagreeCount;
  }

  public render() {
    const { questionId, questionSlug, answers } = this.props;

    const orderedAnswers = answers.sort((a, b) => AnswersList.getScore(b) - AnswersList.getScore(a));

    return (
      <>
        <div className="clearfix">
          <div className="float-right">
            <NewAnswer questionId={questionId} />
          </div>
        </div>
        <ul className="list-unstyled mt-3 mb-3">
          {orderedAnswers.map((x: AnswerModel, i: number) =>
            <li key={i} className="mb-4">
              <AnswerSummary questionId={questionId} questionSlug={questionSlug} answer={x} />
            </li>)
          }
        </ul>
        {answers.length === 0 &&
          <div className="text-center">
            <label>No answers yet...</label>
          </div>
        }
        {answers.length >= 5 &&
          <div className="clearfix">
            <div className="float-right">
              <NewAnswer questionId={questionId} />
            </div>
          </div>
        }
      </>
    );
  }
}
