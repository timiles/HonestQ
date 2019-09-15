import React from 'react';
import { View } from 'react-native';
import { DrawerItems, DrawerItemsProps } from 'react-navigation';
import { HQText } from './hq-components';
import hqStyles from './hq-styles';
import { LoggedInUserContext } from './LoggedInUserContext';

export default class CustomDrawer extends React.Component<DrawerItemsProps> {

  public render() {
    const { items } = this.props;

    return (
      <View style={hqStyles.statusBarMargin}>
        <LoggedInUserContext.Consumer>
          {(user) => <HQText style={hqStyles.m1}>Hi, {user.username}!</HQText>}
        </LoggedInUserContext.Consumer>
        <DrawerItems {...this.props} items={items.filter((x) => x.key !== 'App')} />
      </View>
    );
  }
}
