import * as React from 'react';

interface Props {
    width: number;
    height: number;
}

export default class AgreeIcon extends React.Component<Props> {

    public render() {
        const { width, height } = this.props;
        return (
            <svg viewBox="0 0 448.8 448.8" width={width} height={height}>
                <g>
                    <polygon points="142.8,323.85 35.7,216.75 0,252.45 142.8,395.25 448.8,89.25 413.1,53.55" />
                </g>
            </svg>
        );
    }
}
