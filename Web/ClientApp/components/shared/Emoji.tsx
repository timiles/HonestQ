import * as React from 'react';
import AgreeIcon from './AgreeIcon';
import CommentIcon from './CommentIcon';
import DisagreeIcon from './DisagreeIcon';
import RecentIcon from './RecentIcon';
import UpvoteIcon from './UpvoteIcon';
import WatchIcon from './WatchIcon';

interface Props {
    value: EmojiValue;
}

export enum EmojiValue {
    Answer,
    Question,
    Agree,
    Neutral,
    Disagree,
    Upvote,
    ThisMadeMeThink,
    ThisChangedMyView,
    NotRelevant,
    YouBeTrolling,
    Discuss,
    Watch,
    Recent,
}

export default class Emoji extends React.Component<Props, {}> {

    public static getEmojiByString(value: string): string | JSX.Element {
        return Emoji.getEmoji(EmojiValue[value as keyof typeof EmojiValue]);
    }

    public static getEmoji(value: EmojiValue): string | JSX.Element {
        switch (value) {
            case EmojiValue.Question: return <img className="img-fluid" src="/assets/avatar.png" />;
            case EmojiValue.Answer: return '🙋';
            case EmojiValue.Agree: return <AgreeIcon width={21} height={16} />;
            case EmojiValue.Neutral: return <CommentIcon width={16} height={16} />;
            case EmojiValue.Disagree: return <DisagreeIcon width={16} height={16} />;
            case EmojiValue.Upvote: return <UpvoteIcon width={18} height={16} />;
            case EmojiValue.ThisMadeMeThink: return '🤔';
            case EmojiValue.ThisChangedMyView: return '🤯';
            case EmojiValue.NotRelevant: return '⁉';
            case EmojiValue.YouBeTrolling: return '🤡';
            case EmojiValue.Discuss: return <CommentIcon width={16} height={16} />;
            case EmojiValue.Watch: return <WatchIcon width={23} height={23} />;
            case EmojiValue.Recent: return <RecentIcon width={18} height={18} />;
            default: return '';
        }
    }

    public render() {
        return <span className="emoji">{Emoji.getEmoji(this.props.value)}</span>;
    }
}
