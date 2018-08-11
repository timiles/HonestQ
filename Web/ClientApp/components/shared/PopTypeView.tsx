import * as React from 'react';

interface Props {
    value: string;
}

export default class PopTypeView extends React.Component<Props, {}> {

    public render() {
        switch (this.props.value) {
            case 'Invalid': return null;
            case 'Statement': return <span className="open-quote" />;
            case 'ProveIt': return '🕵';
            case 'Question': return '❓';
            case 'Warning': return '⚠️';
            default: return null;
        }
    }
}
