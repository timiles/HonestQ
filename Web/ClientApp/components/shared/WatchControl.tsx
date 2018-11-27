import * as React from 'react';
import ButtonOrLogIn from './ButtonOrLogIn';
import Emoji, { EmojiValue } from './Emoji';

interface Props {
    identifier?: any;
    onWatch: (on: boolean, identifier?: any) => void;
    count: number;
    isWatchedByLoggedInUser: boolean;
}

interface State {
    count: number;
    isWatchedByLoggedInUser: boolean;
}

export default class WatchControl extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { count: this.props.count, isWatchedByLoggedInUser: this.props.isWatchedByLoggedInUser };

        this.handleChange = this.handleChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        this.setState({ count: nextProps.count, isWatchedByLoggedInUser: nextProps.isWatchedByLoggedInUser });
    }

    public render() {
        const { count, isWatchedByLoggedInUser } = this.state;

        return (
            <ButtonOrLogIn
                type="button"
                className={`btn btn-outline-secondary background-white ${isWatchedByLoggedInUser ? 'active' : ''}`}
                onClick={this.handleChange}
            >
                <Emoji value={EmojiValue.Watch} />
                {count}
            </ButtonOrLogIn>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        this.props.onWatch(!this.state.isWatchedByLoggedInUser, this.props.identifier);
    }
}
