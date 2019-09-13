import React from 'react';
import { Switch, View } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import LogOutButton from '../components/LogOutButton';
import { HQHeader } from '../hq-components';
import hqStyles from '../hq-styles';
import { ApplicationState } from '../store';
import * as SettingsStore from '../store/ThemeSetting';
import ThemeService from '../ThemeService';

const mapStateToProps = (state: ApplicationState) => (state.themeSetting);
const mapDispatchToProps = SettingsStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

class SettingsScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Settings',
  };

  public render() {
    const { theme } = this.props;
    return (
      <View style={ThemeService.getStyles().contentView}>
        <View style={[hqStyles.row, hqStyles.p1]}>
          <HQHeader>Light / Dark mode</HQHeader>
          <Switch
            style={hqStyles.ml1}
            onValueChange={(value) => this.props.setTheme(value ? 'dark' : 'light')}
            value={theme === 'dark'}
          />
        </View>
        <View style={hqStyles.m1}>
          <LogOutButton />
        </View>
      </View>
    );
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SettingsScreen);
