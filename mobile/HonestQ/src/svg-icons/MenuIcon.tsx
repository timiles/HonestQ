import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import hqStyles from '../hq-styles';

interface Props {
  fill: string;
}
export default class MenuIcon extends React.Component<Props> {

  public render() {
    const { fill } = this.props;
    const width = 25;

    return (
      <View style={hqStyles.icon}>
        <Svg viewBox="0 0 512 512" width={width} height={width} fill={fill}>
          <Path
            d="M491.318,235.318H20.682C9.26,235.318,0,244.577,0,256s9.26,20.682,20.682,20.682h470.636
            c11.423,0,20.682-9.259,20.682-20.682C512,244.578,502.741,235.318,491.318,235.318z"
          />
          <Path
            d="M491.318,78.439H20.682C9.26,78.439,0,87.699,0,99.121c0,11.422,9.26,20.682,20.682,20.682h470.636
            c11.423,0,20.682-9.26,20.682-20.682C512,87.699,502.741,78.439,491.318,78.439z"
          />
          <Path
            d="M491.318,392.197H20.682C9.26,392.197,0,401.456,0,412.879s9.26,20.682,20.682,20.682h470.636
            c11.423,0,20.682-9.259,20.682-20.682S502.741,392.197,491.318,392.197z"
          />
        </Svg>
      </View>
    );
  }
}
