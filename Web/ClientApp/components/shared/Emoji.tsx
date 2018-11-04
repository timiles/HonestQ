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

    public static getEmojiByString(value: string): string {
        return Emoji.getEmoji(EmojiValue[value as keyof typeof EmojiValue]);
    }

    public static getEmoji(value: EmojiValue): string {
        switch (value) {
            case EmojiValue.Question: return '❓';
            case EmojiValue.Answer: return '🙋';
            case EmojiValue.Agree: return '✔️';
            case EmojiValue.Neutral: return '🤷';
            case EmojiValue.Disagree: return '❌';
            case EmojiValue.GoodPointWellMade: return '💯';
            case EmojiValue.ThisMadeMeThink: return '🤔';
            case EmojiValue.ThisChangedMyView: return '🤯';
            case EmojiValue.NotRelevant: return '⁉';
            case EmojiValue.YouBeTrolling: return '🤡';
            default: return '';
        }
    }

    public render() {
        return <span className="emoji">{Emoji.getEmoji(this.props.value)}</span>;
    }
}
