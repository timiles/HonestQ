import * as React from 'react';
import AgreeIcon from './AgreeIcon';
import CommentIcon from './CommentIcon';
import DisagreeIcon from './DisagreeIcon';
import RecentIcon from './RecentIcon';
import UpvoteIcon from './UpvoteIcon';
import WatchIcon from './WatchIcon';

interface Props {
    value: IconValue;
}

export enum IconValue {
    Agree,
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

export default class Icon extends React.Component<Props, {}> {

    public static getIconByString(value: string): string | JSX.Element {
        return Icon.getIcon(IconValue[value as keyof typeof IconValue]);
    }

    public static getIcon(value: IconValue): string | JSX.Element {
        switch (value) {
            case IconValue.Agree: return <AgreeIcon width={21} height={16} />;
            case IconValue.Disagree: return <DisagreeIcon width={16} height={16} />;
            case IconValue.Upvote: return <UpvoteIcon width={18} height={16} />;
            case IconValue.ThisMadeMeThink: return '🤔';
            case IconValue.ThisChangedMyView: return '🤯';
            case IconValue.NotRelevant: return '⁉';
            case IconValue.YouBeTrolling: return '🤡';
            case IconValue.Discuss: return <CommentIcon width={16} height={16} />;
            case IconValue.Watch: return <WatchIcon width={23} height={23} />;
            case IconValue.Recent: return <RecentIcon width={18} height={18} />;
            default: return '';
        }
    }

    public render() {
        return <span className="icon">{Icon.getIcon(this.props.value)}</span>;
    }
}
