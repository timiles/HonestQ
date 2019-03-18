import * as $ from 'jquery';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';
import Icon, { IconValue } from '../shared/Icon';

interface Props {
    answerId: number;
    commentId?: number;
    reactionCounts: { [key: string]: number };
    myReactions: string[];
    onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void;
    showHelp?: boolean;
}

interface State {
    reactionCounts: { [key: string]: number };
    myReactions: string[];
}

interface ReactionValue {
    value: string;
    description: string;
}

export default class ReactionsControl extends React.Component<Props, State> {

    private readonly values = new Array<ReactionValue>();
    private readonly reactionDefinitionsPopoverRef?: React.RefObject<HTMLButtonElement>;
    private readonly reactionDefinitionsHtml: string = '';

    constructor(props: Props) {
        super(props);

        this.state = { reactionCounts: this.props.reactionCounts, myReactions: this.props.myReactions };

        this.values.push({ value: 'Upvote', description: 'Upvote' });
        this.values.push({ value: 'ThisMadeMeThink', description: 'This made me think' });
        this.values.push({ value: 'ThisChangedMyView', description: 'This changed my view' });

        if (this.props.showHelp) {
            this.reactionDefinitionsPopoverRef = React.createRef<HTMLButtonElement>();
            this.reactionDefinitionsHtml =
                `<dl class="button-definitions">
                ${this.values.map((x: ReactionValue) =>
                    `<dt><span class="icon">${Icon.getIconByString(x.value)}</span></dt>
                    <dd>${x.description}</dd>`).join('')}
                </dl>`;
        }

        this.handleChange = this.handleChange.bind(this);
    }

    public componentDidMount() {
        if (this.reactionDefinitionsPopoverRef) {
            const popoverElement = ReactDOM.findDOMNode(this.reactionDefinitionsPopoverRef.current!) as Element;
            if (popoverElement) {
                $(popoverElement).popover();
            }
        }
    }

    public render() {
        const { showHelp } = this.props;
        const { reactionCounts, myReactions } = this.state;

        return (
            <>
                <div className="reactions-control btn-group">
                    {this.values.map((x: ReactionValue, i: number) =>
                        <ButtonOrLogIn
                            key={i}
                            type="button"
                            className={`btn btn-outline-secondary
                                ${myReactions && myReactions.indexOf(x.value) >= 0 ? 'active' : ''}`}
                            value={x.value}
                            onClick={this.handleChange}
                        >
                            <Icon value={IconValue[x.value as keyof typeof IconValue]} />
                            {reactionCounts[x.value] || 0}
                        </ButtonOrLogIn>)
                    }
                </div>
                {showHelp &&
                    <button
                        ref={this.reactionDefinitionsPopoverRef}
                        tabIndex={0}
                        className="btn badge badge-pill badge-info ml-1"
                        role="button"
                        type="button"
                        data-trigger="focus"
                        title="Reaction buttons"
                        data-content={this.reactionDefinitionsHtml}
                        data-html={true}
                        data-placement="top"
                    >
                        ?
                    </button>
                }
            </>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        const { answerId, commentId } = this.props;
        const { myReactions } = this.state;
        const { value } = event.currentTarget;
        this.props.onReaction(value, myReactions.indexOf(value) < 0, answerId, commentId);
    }
}
