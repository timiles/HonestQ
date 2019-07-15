import React from 'react';
import { View } from 'react-native';
import { DrawerItems, DrawerItemsProps } from 'react-navigation';
import LogOutButton from './components/LogOutButton';
import { HQText } from './hq-components';
import hqStyles from './hq-styles';
import { LoggedInUserContext } from './LoggedInUserContext';

export default class CustomDrawer extends React.Component<DrawerItemsProps> {

  public render() {
    const { items } = this.props;

    return (
      <View style={hqStyles.mt3}>
        <LoggedInUserContext.Consumer>
          {(user) => <HQText>Hello, {user.username}</HQText>}
        </LoggedInUserContext.Consumer>
        <DrawerItems {...this.props} items={items} />
        <LogOutButton />
      </View>
    );
  }
}
