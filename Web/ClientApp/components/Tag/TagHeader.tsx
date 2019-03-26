import * as React from 'react';
import { TagModel } from '../../server-models';
import { CircleIconValue } from '../shared/CircleIcon';
import Header from '../shared/Header';

interface Props {
    tag: TagModel;
    onWatch: (on: boolean) => void;
}

export default class TagHeader extends React.Component<Props> {

    public render() {
        const { tag, onWatch } = this.props;

        return (
            <Header
                circleIconValue={CircleIconValue.Tag}
                text={tag.name}
                childCount={tag.questions.length}
                childName="question"
                watching={tag.watching}
                onWatch={onWatch}
            />
        );
    }
}
