import * as React from 'react';
import ButtonOrLogIn from './ButtonOrLogIn';
import Emoji, { EmojiValue } from './Emoji';

interface Props {
    identifier?: any;
    onWatch: (on: boolean, identifier?: any) => void;
    isWatchedByLoggedInUser: boolean;
    hideLabelOnMobile?: boolean;
}

interface State {
    isWatchedByLoggedInUser: boolean;
}

export default class WatchControl extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isWatchedByLoggedInUser: this.props.isWatchedByLoggedInUser };

        this.handleChange = this.handleChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        this.setState({ isWatchedByLoggedInUser: nextProps.isWatchedByLoggedInUser });
    }

    public render() {
        const { hideLabelOnMobile } = this.props;
        const { isWatchedByLoggedInUser } = this.state;
        const watchingClassName = isWatchedByLoggedInUser ? 'btn-success' : 'btn-outline-secondary background-white';

        return (
            <ButtonOrLogIn
                type="button"
                className={`btn ${watchingClassName}`}
                onClick={this.handleChange}
            >
                <Emoji value={EmojiValue.Watch} />
                <span className={`ml-1 ${hideLabelOnMobile ? 'd-none d-md-inline-block' : ''}`}>
                    {isWatchedByLoggedInUser ? 'Watching' : 'Watch'}
                </span>
            </ButtonOrLogIn>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        this.props.onWatch(!this.state.isWatchedByLoggedInUser, this.props.identifier);
    }
}
