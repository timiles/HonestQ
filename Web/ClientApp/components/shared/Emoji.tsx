import * as React from 'react';

interface Props {
    value: EmojiValue;
}

export enum EmojiValue {
    Answer,
    Question,
    Agree,
    Neutral,
    Disagree,
    GoodPointWellMade,
    ThisMadeMeThink,
    ThisChangedMyView,
    NotRelevant,
    YouBeTrolling,
}

export default class Emoji extends React.Component<Props, {}> {

    public render() {
        return <span className={`emoji emoji-${EmojiValue[this.props.value]}`} />;
    }
}
