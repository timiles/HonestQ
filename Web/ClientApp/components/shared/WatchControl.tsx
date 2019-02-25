import * as React from 'react';
import ButtonOrLogIn from './ButtonOrLogIn';
import Emoji, { EmojiValue } from './Emoji';

interface Props {
    identifier?: any;
    onWatch: (on: boolean, identifier?: any) => void;
    watching: boolean;
    hideLabelOnMobile?: boolean;
}

interface State {
    watching: boolean;
    submitting: boolean;
}

export default class WatchControl extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { watching: this.props.watching, submitting: false };

        this.handleChange = this.handleChange.bind(this);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Props) {
        this.setState({ watching: nextProps.watching, submitting: false });
    }

    public render() {
        const { hideLabelOnMobile } = this.props;
        const { watching, submitting } = this.state;
        const watchingClassName = watching ? 'btn-success' : 'btn-outline-secondary background-white';

        return (
            <ButtonOrLogIn
                type="button"
                className={`btn ${watchingClassName}`}
                onClick={this.handleChange}
                submitting={submitting}
            >
                <Emoji value={EmojiValue.Watch} />
                <span className={`ml-1 ${hideLabelOnMobile ? 'd-none d-md-inline-block' : ''}`}>
                    {watching ? 'Watching' : 'Watch'}
                </span>
            </ButtonOrLogIn>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ submitting: true },
            () => this.props.onWatch(!this.state.watching, this.props.identifier));
    }
}
