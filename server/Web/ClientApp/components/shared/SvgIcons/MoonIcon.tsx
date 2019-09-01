import React from 'react';

interface Props {
  width: number;
  height: number;
}

// tslint:disable:max-line-length
export default class MoonIcon extends React.Component<Props> {

  public render() {
    const { width, height } = this.props;
    return (
      <svg viewBox="0 0 383.186 383.186" width={width} height={height}>
        <g>
          <path
            d="M351.132,252.524c-2.05-0.97-4.416-1.023-6.508-0.148h0.08c-86.719,35.869-186.096-5.353-221.965-92.072
            c-18.193-43.985-17.103-93.585,3.005-136.728c1.889-3.994,0.182-8.763-3.812-10.652c-2.05-0.97-4.416-1.023-6.508-0.148
            C20.363,51.826-25.044,160.544,14.005,255.605c39.049,95.061,147.767,140.468,242.829,101.419
            c43.356-17.81,78.394-51.325,98.111-93.848C356.833,259.182,355.126,254.413,351.132,252.524z"
          />
        </g>
    </svg>
    );
  }
}
