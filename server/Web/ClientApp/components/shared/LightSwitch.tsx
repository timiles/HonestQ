import React from 'react';
import { setDarkMode } from '../../utils/html-utils';
import MoonIcon from './SvgIcons/MoonIcon';
import SunIcon from './SvgIcons/SunIcon';

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
      <div className="btn-group btn-group-light-switch">
        <button
          className={`btn ${!isDarkMode ? 'active' : ''}`}
          onClick={this.toggleLightDarkMode}
        >
          <SunIcon width={16} height={16} />
        </button>
        <button
          className={`btn ${isDarkMode ? 'active' : ''}`}
          onClick={this.toggleLightDarkMode}
        >
          <MoonIcon width={16} height={16} />
        </button>
      </div>
    );
  }

  private toggleLightDarkMode(): void {
    this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }),
      () => {
        setDarkMode(this.state.isDarkMode);
      });
  }
}
