import * as $ from 'jquery';
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

    private readonly values = new Map<string, string>();

    constructor(props: Props) {
        super(props);

        this.state = { reactionCounts: this.props.reactionCounts, myReactions: this.props.myReactions };

        this.values.set('GoodPointWellMade', 'Good point!');
        this.values.set('ThisMadeMeThink', 'This made me think');
        this.values.set('ThisChangedMyView', 'This changed my view');
        this.values.set('NotRelevant', 'Not relevant');
        this.values.set('YouBeTrolling', 'You be trollin\'');

        this.handleChange = this.handleChange.bind(this);
    }

    public componentDidMount() {
        $('[data-toggle="popover"]').popover();
    }

    public render() {
        const { reactionCounts, myReactions } = this.state;

        const reactionDefinitionsHtml =
            `<dl class="reaction-definitions">
            ${Array.from(this.values.keys()).map((key: string) =>
                `<dt><span class="emoji emoji-${key}" /></dt><dd>${this.values.get(key)}</dd>`).join('')}
            </dl>`;

        return (
            <>
                <div className="btn-group">
                    {Array.from(this.values.keys()).map((key: string, i: number) =>
                        <button
                            key={i}
                            type="button"
                            className={`btn btn-outline-secondary ${myReactions.indexOf(key) >= 0 ? 'active' : ''}`}
                            value={key}
                            onClick={this.handleChange}
                        >
                            <Emoji value={EmojiValue[key as keyof typeof EmojiValue]} />
                            {reactionCounts[key] || 0}
                        </button>)
                    }
                </div>

                <button
                    tabIndex={0}
                    className="btn badge badge-pill badge-info ml-1"
                    role="button"
                    data-toggle="popover"
                    data-trigger="focus"
                    title="Reaction buttons"
                    data-content={reactionDefinitionsHtml}
                    data-html={true}
                    data-placement="top"
                >
                    ?
                </button>
            </>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        const { id } = this.props;
        const { myReactions } = this.state;
        const { value } = event.currentTarget;
        this.props.onReaction(id, value, myReactions.indexOf(value) < 0);
    }
}
