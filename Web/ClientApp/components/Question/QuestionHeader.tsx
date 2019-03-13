import * as React from 'react';
import { QuestionModel } from '../../server-models';
import EmbeddedContent from '../shared/EmbeddedContent';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Source from '../shared/Source';
import WatchControl from '../shared/WatchControl';

interface Props {
    question: QuestionModel;
    onWatch: (on: boolean) => void;
}

export default class QuestionHeader extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { question } = this.props;

        return (
            <div className="card card-body bg-light">
                <blockquote className="blockquote mb-0">
                    <p>
                        <Emoji value={EmojiValue.Question} /> HonestQ:
                        </p>
                    <h4><span className="post quote-marks">{question.text}</span></h4>
                    <footer className="blockquote-footer">
                        {question.postedBy}
                    </footer>
                    <Source value={question.source} />
                    <EmbeddedContent value={question.source} />
                </blockquote>
                <div>
                    <div className="float-right">
                        <WatchControl
                            onWatch={this.handleWatch}
                            watching={question.watching}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private handleWatch(on: boolean): void {
        this.props.onWatch(on);
    }
}
