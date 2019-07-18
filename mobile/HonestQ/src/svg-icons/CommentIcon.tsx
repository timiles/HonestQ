import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default class CommentIcon extends React.Component {

  public render() {
    const width = 16;
    return (
      <Svg viewBox="0 0 510 510" width={width} height={width} fill="#FFF">
        <Path d="M459,0H51C22.95,0,0,22.95,0,51v459l102-102h357c28.05,0,51-22.95,51-51V51C510,22.95,487.05,0,459,0z" />
      </Svg>
    );
  }
}
