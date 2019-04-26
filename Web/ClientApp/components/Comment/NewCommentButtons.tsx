import * as React from 'react';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';
import Icon, { IconValue } from '../shared/SvgIcons/Icon';

interface Props {
    className?: string;
    onClick: (agreementRating: string) => void;
}

export default class NewCommentButtons extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleOpenAgree = this.handleOpenAgree.bind(this);
        this.handleOpenDisagree = this.handleOpenDisagree.bind(this);
        this.handleOpenNeutral = this.handleOpenNeutral.bind(this);
    }

    public render() {
        const { className = '' } = this.props;

        return (
            <div>
                <ButtonOrLogIn
                    type="button"
                    className={`${className} mr-2`}
                    onClick={this.handleOpenAgree}
                >
                    <Icon value={IconValue.Agree} />
                    Agree
                </ButtonOrLogIn>
                <ButtonOrLogIn
                    type="button"
                    className={`${className} mr-2`}
                    onClick={this.handleOpenDisagree}
                >
                    <Icon value={IconValue.Disagree} />
                    Disagree
                </ButtonOrLogIn>
                <ButtonOrLogIn
                    type="button"
                    className={className}
                    onClick={this.handleOpenNeutral}
                >
                    <Icon value={IconValue.Neutral} />
                    Neutral
                </ButtonOrLogIn>
            </div>
        );
    }

    private handleOpenAgree() {
        this.props.onClick('Agree');
    }

    private handleOpenDisagree() {
        this.props.onClick('Disagree');
    }

    private handleOpenNeutral() {
        this.props.onClick('Neutral');
    }
}
