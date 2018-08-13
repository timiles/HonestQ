import * as React from 'react';

interface Props {
    value: string;
}

export default class PopTypeView extends React.Component<Props, {}> {

    public render() {
        return <span className={`poptype poptype-${this.props.value.toLowerCase()}`} />;
    }
}
