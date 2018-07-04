import * as React from 'react';

interface Props {
    value: string;
}

export default class StanceView extends React.Component<Props, {}> {

    private readonly stanceValues = new Map([['NA', null], ['Pro', '👍'], ['Con', '👎']]);

    public render() {
        return this.stanceValues.get(this.props.value);
    }
}
