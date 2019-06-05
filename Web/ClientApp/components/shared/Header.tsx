import * as React from 'react';
import { getItemCountText } from '../../utils/string-utils';
import CircleIcon, { CircleIconValue } from './CircleIcon';
import WatchControl from './WatchControl';

interface Props {
    circleIconValue: CircleIconValue;
    text: string;
    childCount: number;
    childName: string;
    watching: boolean;
    onWatch: (on: boolean) => void;
}

export default class Header extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { circleIconValue, text, childCount, childName, watching } = this.props;

        const childHeader = getItemCountText(childName, childCount);

        return (
            <div className="header mb-3">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 pt-3">
                            <WatchControl
                                onWatch={this.handleWatch}
                                watching={watching}
                            />
                        </div>
                    </div>
                </div>
                <hr />
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <CircleIcon className="float-left" value={circleIconValue} />
                            <div className="ml-5">
                                <h4><span className="post">{text}</span></h4>
                                <p className="child-count">{childHeader}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleWatch(on: boolean): void {
        this.props.onWatch(on);
    }
}
