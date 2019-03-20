import * as React from 'react';
import { setDarkMode } from '../../utils/html-utils';

interface State {
    isDarkMode: boolean;
}

export default class LightSwitch extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = { isDarkMode: false };

        this.toggleLightDarkMode = this.toggleLightDarkMode.bind(this);
    }

    public render() {
        const { isDarkMode } = this.state;
        return (
            <button
                className={`btn btn-outline-${isDarkMode ? 'light' : 'dark'}`}
                onClick={this.toggleLightDarkMode}
            >
                {isDarkMode ? 'Light mode' : 'Dark mode'}
            </button>
        );
    }

    private toggleLightDarkMode(): void {
        this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }),
            () => {
                setDarkMode(this.state.isDarkMode);
            });
    }
}
