import React from 'react';
import Svg, { Path } from 'react-native-svg';
import ThemeService from '../ThemeService';

export default class NotificationIcon extends React.Component {

  public render() {
    const fill = ThemeService.getNavTextColor();
    const width = 23;

    // tslint:disable:max-line-length
    return (
      <Svg viewBox="0 0 300 300" width={width} height={width} fill={fill}>
        <Path
          d="M149.996,0C67.157,0,0.001,67.161,0.001,149.997S67.157,300,149.996,300s150.003-67.163,150.003-150.003
          S232.835,0,149.996,0z M149.999,232.951c-10.766,0-19.499-8.725-19.499-19.499h38.995
          C169.497,224.226,160.765,232.951,149.999,232.951z M215.889,193.9h-0.005v-0.001c0,7.21-5.843,7.685-13.048,7.685H97.16
          c-7.208,0-13.046-0.475-13.046-7.685v-1.242c0-5.185,3.045-9.625,7.42-11.731l4.142-35.753c0-26.174,18.51-48.02,43.152-53.174
          v-13.88c0-6.17,5.003-11.173,11.176-11.173c6.17,0,11.173,5.003,11.173,11.173V92c24.642,5.153,43.152,26.997,43.152,53.174
          l4.142,35.758c4.375,2.109,7.418,6.541,7.418,11.726V193.9z"
        />
      </Svg>
    );
  }
}
