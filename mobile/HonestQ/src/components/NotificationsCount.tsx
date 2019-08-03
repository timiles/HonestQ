import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';
import { HQLabel } from '../hq-components';
import hqStyles from '../hq-styles';
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
    if (!notificationsCount || notificationsCount.count === 0) {
      return null;
    }

    return (
      <View style={hqStyles.flexRowPullRight}>
        <Text>🔔</Text>
        <View style={styles.countLabel}>
          <HQLabel style={{ color: '#fff' }}>
            {notificationsCount.count}
          </HQLabel>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => (state.notificationsCount);
export default connect(mapStateToProps, NotificationsCountStore.actionCreators)(NotificationsCount);

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  countLabel: {
    backgroundColor: '#dc3545',
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingTop: 2,
    borderRadius: 5,
  } as ViewStyle,
});
