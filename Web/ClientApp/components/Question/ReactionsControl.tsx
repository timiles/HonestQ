import * as React from 'react';
import { CommentModel } from '../../server-models';
import Emoji, { EmojiValue } from '../shared/Emoji';

type Props = CommentModel & {
    onReaction: (commentId: number, reactionType: string, on: boolean) => void,
};

interface State {
    reactionCounts: { [key: string]: number };
    myReactions: string[];
}

export default class ReactionsControl extends React.Component<Props, State> {

    private readonly values = new Map();

    constructor(props: Props) {
        super(props);

        this.state = { reactionCounts: this.props.reactionCounts, myReactions: this.props.myReactions };

        this.values.set('GoodPointWellMade', <Emoji value={EmojiValue.GoodPointWellMade} />);
        this.values.set('ThisMadeMeThink', <Emoji value={EmojiValue.ThisMadeMeThink} />);
        this.values.set('ThisChangedMyView', <Emoji value={EmojiValue.ThisChangedMyView} />);
        this.values.set('NotRelevant', <Emoji value={EmojiValue.NotRelevant} />);
        this.values.set('YouBeTrolling', <Emoji value={EmojiValue.YouBeTrolling} />);

        this.handleChange = this.handleChange.bind(this);
    }

    public render() {
        const { reactionCounts, myReactions } = this.state;

        return (
            <div className="btn-group">
                {Array.from(this.values.keys()).map((key: string, i: number) =>
                    <button
                        key={i}
                        type="button"
                        className={`btn btn-outline-secondary ${myReactions.indexOf(key) >= 0 ? 'active' : ''}`}
                        value={key}
                        onClick={this.handleChange}
                    >
                        {this.values.get(key)}
                        {reactionCounts[key] || 0}
                    </button>)
                }
            </div>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        const { id } = this.props;
        const { myReactions } = this.state;
        const { value } = event.currentTarget;
        this.props.onReaction(id, value, myReactions.indexOf(value) < 0);
    }
}
