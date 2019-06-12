import React from 'react';
import ButtonOrLogIn from './ButtonOrLogIn';
import Icon, { IconValue } from './SvgIcons/Icon';

interface Props {
    identifier?: any;
    onWatch: (on: boolean, identifier?: any) => void;
    watching: boolean;
    hideLabelOnMobile?: boolean;
}

interface State {
    submitting: boolean;
}

export default class WatchControl extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { submitting: false };

        this.handleChange = this.handleChange.bind(this);
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.watching !== prevProps.watching) {
            this.setState({ submitting: false });
        }
    }

    public render() {
        const { watching, hideLabelOnMobile } = this.props;
        const { submitting } = this.state;

        return (
            <ButtonOrLogIn
                type="button"
                className={`btn btn-outline-secondary ${watching ? 'active btn-primary-brand' : 'btn-watch'}`}
                onClick={this.handleChange}
                submitting={submitting}
            >
                <span className={`mr-2 ${hideLabelOnMobile ? 'd-none d-md-inline-block' : ''}`}>
                    {watching ? 'Watching' : 'Watch'}
                </span>
                <Icon value={IconValue.Watch} />
            </ButtonOrLogIn>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ submitting: true },
            () => this.props.onWatch(!this.props.watching, this.props.identifier));
    }
}
