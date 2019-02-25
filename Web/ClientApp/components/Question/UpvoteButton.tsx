import * as React from 'react';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';
import Emoji, { EmojiValue } from '../shared/Emoji';

interface Props {
    answerId: number;
    commentId?: number;
    count: number;
    isUpvotedByLoggedInUser: boolean;
    onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void;
    hideLabelOnMobile?: boolean;
}

interface State {
    count: number;
    isUpvotedByLoggedInUser: boolean;
    submitting: boolean;
}

export default class UpvoteButton extends React.Component<Props, State> {
    public static ReactionType: string = 'Upvote';

    constructor(props: Props) {
        super(props);

        this.state = {
            count: this.props.count,
            isUpvotedByLoggedInUser: this.props.isUpvotedByLoggedInUser,
            submitting: false,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Props) {
        this.setState({
            count: nextProps.count,
            isUpvotedByLoggedInUser: nextProps.isUpvotedByLoggedInUser,
            submitting: false,
        });
    }

    public render() {
        const { hideLabelOnMobile } = this.props;
        const { count, isUpvotedByLoggedInUser, submitting } = this.state;
        const upvotedClassName = isUpvotedByLoggedInUser ? 'btn-success' : 'btn-outline-secondary background-white';

        return (
            <ButtonOrLogIn
                type="button"
                className={`btn ${upvotedClassName}`}
                onClick={this.handleChange}
                submitting={submitting}
            >
                <Emoji value={EmojiValue.Upvote} />
                <span className={`ml-1 ${hideLabelOnMobile ? 'd-none d-md-inline-block' : ''}`}>
                    Upvote
                </span>
                {count > 0 &&
                    <span className={`ml-2 badge ${isUpvotedByLoggedInUser ? 'badge-light' : 'badge-info'}`}>
                        {count}
                    </span>
                }
            </ButtonOrLogIn>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        const { answerId, commentId } = this.props;
        const { isUpvotedByLoggedInUser } = this.state;
        this.setState({ submitting: true },
            () => this.props.onReaction(UpvoteButton.ReactionType, !isUpvotedByLoggedInUser, answerId, commentId));
    }
}
