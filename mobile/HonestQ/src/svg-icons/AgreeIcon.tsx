import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

export default class AgreeIcon extends React.Component {

  public render() {
    return (
      <Svg viewBox="0 0 448.8 448.8" width={21} height={16} fill="#2293A5">
        <Polygon points="142.8,323.85 35.7,216.75 0,252.45 142.8,395.25 448.8,89.25 413.1,53.55" />
      </Svg>
    );
  }
}