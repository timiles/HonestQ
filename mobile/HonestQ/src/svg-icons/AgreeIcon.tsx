import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

interface Props {
  fill?: string;
}
export default class AgreeIcon extends React.Component<Props> {

  public render() {
    const { fill = '#2293A5' } = this.props;
    return (
      <Svg viewBox="0 0 448.8 448.8" width={21} height={16} fill={fill}>
        <Polygon points="142.8,323.85 35.7,216.75 0,252.45 142.8,395.25 448.8,89.25 413.1,53.55" />
      </Svg>
    );
  }
}
