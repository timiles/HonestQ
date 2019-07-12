import React from 'react';
import { View } from 'react-native';
import { DrawerItems, DrawerItemsProps } from 'react-navigation';
import { connect } from 'react-redux';
import LogOutButton from './components/LogOutButton';
import { HQText } from './hq-components';
import hqStyles from './hq-styles';
import { ApplicationState } from './store';
import * as AuthStore from './store/Auth';

type Props = AuthStore.AuthState
  & DrawerItemsProps;

class CustomDrawer extends React.Component<Props> {

  public render() {
    const { loggedInUser, items } = this.props;
    let itemsToDisplay = items;

    if (loggedInUser) {
      itemsToDisplay = items.filter((x) => x.routeName !== 'LogIn' && x.routeName !== 'SignUp');
    }

    return (
      <View style={hqStyles.mt3}>
        {loggedInUser &&
          <HQText>Hello, {loggedInUser.username}</HQText>
          ||
          <HQText>Not logged in.</HQText>
        }
        <DrawerItems {...this.props} items={itemsToDisplay} />
        {loggedInUser &&
          <LogOutButton />
        }
      </View>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => (state.auth);
export default connect(mapStateToProps)(CustomDrawer);
