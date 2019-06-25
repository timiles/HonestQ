import React from 'react';
import { View } from 'react-native';
import { DrawerItems, DrawerItemsProps } from 'react-navigation';
import { connect } from 'react-redux';
import LogOutButton from './components/LogOutButton';
import { HQText } from './hq-components';
import { ApplicationState } from './store';
import * as LoginStore from './store/Login';

type Props = LoginStore.LoginState
  & DrawerItemsProps;

class CustomDrawer extends React.Component<Props> {

  public render() {
    const { loggedInUser, items } = this.props;
    const itemsToDisplay = items.filter((x) => x.routeName !== (loggedInUser ? 'LogIn' : 'LogOut'));

    return (
      <View style={{ paddingTop: 30 }}>
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

const mapStateToProps = (state: ApplicationState) => (state.login);
export default connect(mapStateToProps)(CustomDrawer);
