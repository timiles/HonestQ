import * as React from 'react';
import CircleIcon, { CircleIconValue } from './CircleIcon';
import WatchControl from './WatchControl';

interface Props {
    circleIconValue: CircleIconValue;
    text: string;
    childCount: number;
    childName: string;
    postedBy?: string;
    watching: boolean;
    onWatch: (on: boolean) => void;
}

export default class Header extends React.Component<Props> {

    private static getChildHeader(childCount: number, childName: string): string {
        switch (childCount) {
            case 0: {
                return `No ${childName}s yet`;
            }
            case 1: {
                return `1 ${childName}`;
            }
            default: {
                return `${childCount} ${childName}s`;
            }
        }
    }

    constructor(props: Props) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { postedBy, circleIconValue, text, childCount, childName, watching } = this.props;

        const childHeader = Header.getChildHeader(childCount, childName);

        return (
            <div className="header mb-3">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 pt-3">
                            {postedBy &&
                                <>
                                    <div className="float-left mr-2">
                                        <div className="avatar">
                                            <img className="img-fluid" src="/assets/avatar.png" />
                                        </div>
                                    </div>
                                    <p className="float-left mr-3 mt-2">
                                        {postedBy}
                                    </p>
                                </>
                            }
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
                            <div className="float-left ml-3">
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
