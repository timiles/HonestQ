import * as $ from 'jquery';
import * as React from 'react';
import { generateRandomHtmlId } from '../../utils/html-utils';
import Emoji, { EmojiValue } from '../shared/Emoji';

interface Props {
    name?: string;
    value: string;
    onChange: (event: React.FormEvent<HTMLButtonElement>) => void;
}

interface State {
    value: string;
}

export default class AgreementRatingInput extends React.Component<Props, State> {

    private readonly values = new Array<string>();
    private readonly agreementDefinitionsPopoverId: string;
    private readonly agreementDefinitionsHtml: string;

    constructor(props: Props) {
        super(props);

        this.state = { value: this.props.value || '' };

        this.values = ['Agree', 'Neutral', 'Disagree'];

        this.agreementDefinitionsPopoverId = generateRandomHtmlId('agreementDefinitions');
        this.agreementDefinitionsHtml =
            `<dl class="button-definitions">
            ${this.values.map((x) =>
                `<dt><span class="emoji">${Emoji.getEmojiByString(x)}</span></dt>
                <dd>${x}</dd>`).join('')}
            </dl>`;

        this.handleChange = this.handleChange.bind(this);
    }

    public componentDidMount() {
        if (this.agreementDefinitionsPopoverId) {
            $(`#${this.agreementDefinitionsPopoverId}`).popover();
        }
    }

    public render() {
        const { name } = this.props;
        const { value } = this.state;
        return (
            <>
                <div className="btn-group" role="group">
                    {this.values.map((x: string, i: number) =>
                        <button
                            key={i}
                            type="button"
                            className={`btn btn-outline-secondary ${x === value ? 'active' : ''}`}
                            value={x}
                            name={name}
                            onClick={this.handleChange}
                        >
                            <Emoji value={EmojiValue[x as keyof typeof EmojiValue]} />
                        </button>)
                    }
                </div>
                <button
                    id={this.agreementDefinitionsPopoverId}
                    tabIndex={0}
                    className="btn badge badge-pill badge-info ml-1"
                    role="button"
                    type="button"
                    data-trigger="focus"
                    title="Agreement buttons"
                    data-content={this.agreementDefinitionsHtml}
                    data-html={true}
                    data-placement="right"
                >
                    ?
                </button>
            </>
        );
    }

    private handleChange(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ value: event.currentTarget.value });
        this.props.onChange(event);
    }
}
