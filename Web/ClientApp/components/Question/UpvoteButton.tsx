import * as React from 'react';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';
import Icon, { IconValue } from '../shared/Icon';

interface Props {
    answerId: number;
    commentId?: number;
    count: number;
    isUpvotedByLoggedInUser: boolean;
    onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void;
    hideLabelOnMobile?: boolean;
}

interface State {
    submitting: boolean;
}

export default class UpvoteButton extends React.Component<Props, State> {
    public static ReactionType: string = 'Upvote';

    constructor(props: Props) {
        super(props);

        this.state = { submitting: false };

        this.handleChange = this.handleChange.bind(this);
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.isUpvotedByLoggedInUser !== prevProps.isUpvotedByLoggedInUser) {
            this.setState({ submitting: false });
        }
    }

    public render() {
        const { count, isUpvotedByLoggedInUser, hideLabelOnMobile } = this.props;
        const { submitting } = this.state;
        const upvotedClassName = isUpvotedByLoggedInUser ? 'btn-success' : 'btn-outline-secondary background-white';

        return (
            <ButtonOrLogIn
                type="button"
                className={`btn ${upvotedClassName}`}
                onClick={this.handleChange}
                submitting={submitting}
            >
                <Icon value={IconValue.Upvote} />
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
        const { answerId, commentId, isUpvotedByLoggedInUser } = this.props;
        this.setState({ submitting: true },
            () => this.props.onReaction(UpvoteButton.ReactionType, !isUpvotedByLoggedInUser, answerId, commentId));
    }
}
