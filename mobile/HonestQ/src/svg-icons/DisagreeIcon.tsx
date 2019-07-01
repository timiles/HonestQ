import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

// tslint:disable:max-line-length
export default class DisagreeIcon extends React.Component {

  public render() {
    const width = 14;

    return (
      <Svg viewBox="0 0 357 357" width={width} height={width} fill="#2293A5">
        <Polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3 214.2,178.5" />
      </Svg>
    );
  }
}
