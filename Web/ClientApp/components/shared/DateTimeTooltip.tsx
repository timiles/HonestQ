import * as $ from 'jquery';
import * as moment from 'moment';
import * as React from 'react';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { generateRandomHtmlId } from '../../utils/html-utils';
import { parseDateWithTimeZoneOffset } from '../../utils/string-utils';

interface Props {
    dateTime: string;
}

export default class DateTimeTooltip extends React.Component<Props> {

    private readonly tooltipId: string;

    constructor(props: Props) {
        super(props);

        this.tooltipId = generateRandomHtmlId('tooltip');
    }

    public componentDidMount() {
        $(`#${this.tooltipId}`).tooltip();
    }

    public render() {
        const { dateTime } = this.props;

        return (
            <LoggedInUserContext.Consumer>
                {(user) => {
                    const offsetHours = user ? user.timeZoneOffsetHours : 0;
                    const dateTimeOffset = parseDateWithTimeZoneOffset(dateTime, offsetHours);
                    const dateTimeMoment = moment(dateTimeOffset);
                    const friendlyTime = dateTimeMoment.fromNow();
                    const fullTime = dateTimeMoment.format('LLLL');

                    return (
                        <a
                            id={this.tooltipId}
                            href="javascript:void(0);"
                            data-toggle="tooltip"
                            data-placement="top"
                            title={fullTime}
                        >
                            {friendlyTime}
                        </a>
                    );
                }}
            </LoggedInUserContext.Consumer>
        );
    }
}
