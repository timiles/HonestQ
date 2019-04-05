import * as $ from 'jquery';
import * as moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { parseDateWithTimeZoneOffset } from '../../utils/string-utils';

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

        return (
            <LoggedInUserContext.Consumer>
                {(user) => {
                    const offsetHours = new Date().getTimezoneOffset() / -60;
                    const dateTimeOffset = parseDateWithTimeZoneOffset(dateTime, offsetHours);
                    const dateTimeMoment = moment(dateTimeOffset);
                    const friendlyTime = dateTimeMoment.fromNow();
                    const fullTime = dateTimeMoment.format('LLLL');

                    return (
                        <span
                            ref={this.tooltipRef}
                            data-toggle="tooltip"
                            data-placement="top"
                            title={fullTime}
                        >
                            {friendlyTime}
                        </span>
                    );
                }}
            </LoggedInUserContext.Consumer>
        );
    }
}
