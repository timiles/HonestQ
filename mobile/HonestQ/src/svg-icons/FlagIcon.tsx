import React from 'react';
import Svg, { Path } from 'react-native-svg';
import ThemeService from '../ThemeService';

export default class FlagIcon extends React.Component {

  public render() {
    const fill = ThemeService.getNavTextColor();
    const width = 23;

    // tslint:disable:max-line-length
    return (
      <Svg viewBox="0 0 60 60" width={width} height={width} fill={fill}>
        <Path
          d="M51.371,3.146c-0.203-0.081-5.06-1.997-10.815-1.997c-3.434,0-6.47,0.687-9.024,2.042C29.269,4.392,26.199,5,22.407,5
          C17.099,5,11.865,3.788,10,3.307V1c0-0.553-0.447-1-1-1S8,0.447,8,1v3c0,0.014,0.007,0.026,0.008,0.04C8.008,4.052,8,4.062,8,4.074
          V33v1.074V59c0,0.553,0.447,1,1,1s1-0.447,1-1V35.373C12.273,35.937,17.243,37,22.407,37c4.122,0,7.507-0.688,10.062-2.042
          c2.263-1.201,4.983-1.81,8.087-1.81c5.357,0,10.027,1.836,10.073,1.854c0.309,0.124,0.657,0.086,0.932-0.102
          C51.835,34.716,52,34.406,52,34.074v-30C52,3.665,51.751,3.298,51.371,3.146z"
        />
      </Svg>
    );
  }
}
