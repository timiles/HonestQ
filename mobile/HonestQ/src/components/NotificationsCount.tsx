import React from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';
import hqColors from '../hq-colors';
import { HQLabel } from '../hq-components';
import { ApplicationState } from '../store';
import * as NotificationsCountStore from '../store/NotificationsCount';

type Props = NotificationsCountStore.NotificationsCountState
  & typeof NotificationsCountStore.actionCreators;

class NotificationsCount extends React.Component<Props, {}> {

  public componentDidMount() {
    if (!this.props.notificationsCount) {
      this.props.getNotificationsCount();
    }
  }

  public render() {
    const { notificationsCount } = this.props;
    if (!notificationsCount) {
      return null;
    }

    return (
      <View style={styles.countLabel}>
        <HQLabel style={styles.countLabelText}>
          {notificationsCount.count}
        </HQLabel>
      </View>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => (state.notificationsCount);
export default connect(mapStateToProps, NotificationsCountStore.actionCreators)(NotificationsCount);

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  countLabel: {
    backgroundColor: hqColors.Orange,
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingTop: 2,
    borderRadius: 5,
  } as ViewStyle,

  countLabelText: {
    color: '#fff',
    fontSize: 12,
  } as TextStyle,
});
