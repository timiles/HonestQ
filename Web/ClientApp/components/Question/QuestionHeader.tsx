import React from 'react';
import { QuestionModel } from '../../server-models';
import { CircleIconValue } from '../shared/CircleIcon';
import Header from '../shared/Header';

interface Props {
    question: QuestionModel;
    onWatch: (on: boolean) => void;
}

export default class QuestionHeader extends React.Component<Props> {

    public render() {
        const { question, onWatch } = this.props;

        return (
            <Header
                circleIconValue={CircleIconValue.Question}
                text={question.text}
                childCount={question.answers.length}
                childName="answer"
                watching={question.watching}
                onWatch={onWatch}
            />
        );
    }
}
