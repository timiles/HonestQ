import * as React from 'react';
import { QuestionModel } from '../../server-models';
import CircleTag, { CircleTagValue } from '../shared/CircleTag';
import Emoji, { EmojiValue } from '../shared/Emoji';
import WatchControl from '../shared/WatchControl';

interface Props {
    question: QuestionModel;
    onWatch: (on: boolean) => void;
}

export default class QuestionHeader extends React.Component<Props> {

    private static getAnswersHeader(answersCount: number): string {
        switch (answersCount) {
            case 0: {
                return 'No answers yet';
            }
            case 1: {
                return '1 answer';
            }
            default: {
                return `${answersCount} answers`;
            }
        }
    }

    constructor(props: Props) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { question } = this.props;

        const answersHeader = question ? QuestionHeader.getAnswersHeader(question.answers.length) : null;

        return (
            <div className="header mb-3">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 pt-3">
                            <div className="float-left mr-2">
                                <div className="avatar"><Emoji value={EmojiValue.Question} /></div>
                            </div>
                            <p className="float-left mr-3 mt-2">
                                {question.postedBy}
                            </p>
                            <WatchControl
                                onWatch={this.handleWatch}
                                watching={question.watching}
                            />
                        </div>
                    </div>
                </div>
                <hr />
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <CircleTag className="float-left" value={CircleTagValue.Question} />
                            <div className="float-left ml-3">
                                <h4><span className="post quote-marks">{question.text}</span></h4>
                                <p className="answers-count">{answersHeader}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleWatch(on: boolean): void {
        this.props.onWatch(on);
    }
}
