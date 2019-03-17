import * as React from 'react';

interface Props {
    width: number;
    height: number;
}

// tslint:disable:max-line-length
export default class UpvoteIcon extends React.Component<Props> {

    public render() {
        const { width, height } = this.props;
        return (
            <svg viewBox="0 0 561 561" width={width} height={height}>
                <g>
                    <path
                        d="M0,535.5h102v-306H0V535.5z M561,255c0-28.05-22.95-51-51-51H349.35l25.5-117.3c0-2.55,0-5.1,0-7.65
                        c0-10.2-5.1-20.4-10.199-28.05L336.6,25.5L168.3,193.8c-10.2,7.65-15.3,20.4-15.3,35.7v255c0,28.05,22.95,51,51,51h229.5
                        c20.4,0,38.25-12.75,45.9-30.6l76.5-181.051c2.55-5.1,2.55-12.75,2.55-17.85v-51H561C561,257.55,561,255,561,255z"
                    />
                </g>
            </svg>
        );
    }
}