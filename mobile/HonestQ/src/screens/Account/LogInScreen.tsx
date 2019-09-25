import React from 'react';
import { View } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../../components/KeyboardPaddedScrollView';
import { HQSubmitButton, HQText, HQTextInput } from '../../hq-components';
import hqStyles from '../../hq-styles';
import { LogInFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as LogInStore from '../../store/LogIn';
import ThemeService from '../../ThemeService';

const mapStateToProps = (state: ApplicationState) => (state.logIn);
const mapDispatchToProps = LogInStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

class LogInScreen extends React.Component<Props, LogInFormModel> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Log in to HonestQ',
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      rememberMe: true,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentWillUnmount() {
    this.props.reset();
  }

  public render() {
    const { submitting = false, submitted, error } = this.props;
    const { username, password } = this.state;

    return (
      <KeyboardPaddedScrollView
        style={ThemeService.getStyles().contentView}
        contentContainerStyle={[hqStyles.p1, hqStyles.fillSpace, hqStyles.center]}
      >
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        <HQTextInput
          containerStyle={hqStyles.mb1}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Username or email"
          value={username}
          onChangeText={(text) => this.setState({ username: text })}
          submitted={submitted && !error}
          error={!username ? 'Username is required' : null}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => this.setState({ password: text })}
          submitted={submitted && !error}
          error={!password ? 'Password is required' : null}
        />
        <View style={[hqStyles.row, hqStyles.center, hqStyles.mb1]}>
          <HQSubmitButton title="Log in" onPress={this.handleSubmit} submitting={submitting} />
        </View>
      </KeyboardPaddedScrollView>
    );
  }

  private handleSubmit(): void {
    this.props.submit(this.state);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(LogInScreen);
