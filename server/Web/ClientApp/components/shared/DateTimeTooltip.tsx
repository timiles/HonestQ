import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';

interface Props {
    dateTime: string;
}

export default class DateTimeTooltip extends React.Component<Props> {

    private readonly tooltipRef: React.RefObject<HTMLSpanElement>;

    constructor(props: Props) {
        super(props);

        this.tooltipRef = React.createRef<HTMLSpanElement>();
    }

    public componentDidMount() {
        const tooltipElement = ReactDOM.findDOMNode(this.tooltipRef.current!) as Element;
        if (tooltipElement) {
            $(tooltipElement).tooltip();
        }
    }

    public render() {
        const { dateTime } = this.props;

        const dateTimeMoment = moment(dateTime);
        // Client time could be behind Server time - avoid printing 'in a few seconds'
        const friendlyTime = dateTimeMoment.isAfter(moment.now()) ? 'just now' : dateTimeMoment.fromNow();
        const fullTime = dateTimeMoment.format('LLLL');

        return (
            <span
                className="text-nowrap"
                ref={this.tooltipRef}
                data-toggle="tooltip"
                data-placement="top"
                title={fullTime}
            >
                {friendlyTime}
            </span>
        );
    }
}
