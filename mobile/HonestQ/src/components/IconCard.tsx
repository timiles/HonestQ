import React from 'react';
import { View } from 'react-native';
import { HQCard } from '../hq-components';
import hqStyles from '../hq-styles';
import AgreementLabel from './AgreementLabel';
import CircleIcon from './CircleIcon';

type IconType = 'Q' | 'A' | 'Agree' | 'Disagree';

interface Props {
  type: IconType;
}

export default class IconCard extends React.Component<Props> {

  public render() {
    const { type } = this.props;

    return (
      <HQCard style={hqStyles.rowAlignStart}>
        {this.renderIcon(type)}
        <View style={[hqStyles.fillSpace, hqStyles.mv1, hqStyles.mr1]}>
          {this.props.children}
        </View>
      </HQCard>
    );
  }

  private renderIcon(type: IconType): React.ReactNode {
    switch (type) {
      case 'Q':
      case 'A':
        return <CircleIcon type={type} />;
      case 'Agree':
      case 'Disagree':
        return (
          <View style={{ margin: 5 }}>
            <AgreementLabel isAgree={type === 'Agree'} showLabel={false} />
          </View>
        );
      default:
        return null;
    }
  }
}
