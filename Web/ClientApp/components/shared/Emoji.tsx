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
    Discuss,
}

export default class Emoji extends React.Component<Props, {}> {

    public static getEmojiByString(value: string): string | JSX.Element {
        return Emoji.getEmoji(EmojiValue[value as keyof typeof EmojiValue]);
    }

    public static getEmoji(value: EmojiValue): string | JSX.Element {
        switch (value) {
            case EmojiValue.Question: return <img className="img-fluid" src="/favicon-32x32.png" />;
            case EmojiValue.Answer: return '🙋';
            case EmojiValue.Agree: return '✔️';
            case EmojiValue.Neutral: return '🤷';
            case EmojiValue.Disagree: return '❌';
            case EmojiValue.GoodPointWellMade: return '💯';
            case EmojiValue.ThisMadeMeThink: return '🤔';
            case EmojiValue.ThisChangedMyView: return '🤯';
            case EmojiValue.NotRelevant: return '⁉';
            case EmojiValue.YouBeTrolling: return '🤡';
            case EmojiValue.Discuss: return '💬';
            default: return '';
        }
    }

    public render() {
        return <span className="emoji">{Emoji.getEmoji(this.props.value)}</span>;
    }
}
