import * as React from 'react';
import { TagModel } from '../../server-models';
import CircleIcon, { CircleIconValue } from '../shared/CircleIcon';
import WatchControl from '../shared/WatchControl';

interface Props {
    tag: TagModel;
    onWatch: (on: boolean) => void;
}

export default class TagHeader extends React.Component<Props> {

    private static getQuestionsHeader(questionsCount: number): string {
        switch (questionsCount) {
            case 0: {
                return 'No questions yet';
            }
            case 1: {
                return '1 question';
            }
            default: {
                return `${questionsCount} questions`;
            }
        }
    }

    constructor(props: Props) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { tag } = this.props;

        const questionsHeader = TagHeader.getQuestionsHeader(tag.questions.length);

        return (
            <div className="header mb-3">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 pt-3">
                            <WatchControl
                                onWatch={this.handleWatch}
                                watching={tag.watching}
                            />
                        </div>
                    </div>
                </div>
                <hr />
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <CircleIcon className="float-left" value={CircleIconValue.Tag} />
                            <div className="float-left ml-3">
                                <h4><span className="post">{tag.name}</span></h4>
                                <p className="child-count">{questionsHeader}</p>
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
