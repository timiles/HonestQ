import * as React from 'react';

interface Props {
    width: number;
    height: number;
}

// tslint:disable:max-line-length
export default class CommentIcon extends React.Component<Props> {

    public render() {
        const { width, height } = this.props;
        return (
            <svg viewBox="0 0 510 510" width={width} height={height}>
                <g>
                    <path
                        d="M459,0H51C22.95,0,0,22.95,0,51v459l102-102h357c28.05,0,51-22.95,51-51V51C510,22.95,487.05,0,459,0z"
                    />
                </g>
            </svg>
        );
    }
}
