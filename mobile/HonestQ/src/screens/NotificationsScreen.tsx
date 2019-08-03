import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import AgreementLabel from '../components/AgreementLabel';
import CircleIconCard from '../components/CircleIconCard';
import QuotationMarks from '../components/QuotationMarks';
import { HQActivityIndicator, HQCard, HQHeader, HQLabel, HQLoadingView, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { NotificationModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NotificationsStore from '../store/Notifications';
import ThemeService from '../ThemeService';
import { AnswerNavigationProps } from './AnswerScreen';
import { QuestionNavigationProps } from './QuestionScreen';

type Props = NotificationsStore.ListState
  & typeof NotificationsStore.actionCreators;

interface State {
  loadingMore: boolean;
}
class NotificationScreen extends React.Component<Props, State> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Notifications',
  };

  constructor(props: Props) {
    super(props);

    this.state = { loadingMore: false };

    if (!this.props.notificationsList) {
      this.props.loadMoreNotifications();
    }

    this.loadMore = this.loadMore.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.loadingMore && prevProps.notificationsList && this.props.notificationsList &&
      (prevProps.notificationsList.lastId !== this.props.notificationsList.lastId)) {
      this.setState({ loadingMore: false });
    }
  }

  public render() {
    const { notificationsList } = this.props;

    if (!notificationsList) {
      return <HQLoadingView />;
    }

    return (
      <View style={ThemeService.getStyles().contentView}>
        {notificationsList &&
          <>
            {notificationsList.notifications.length > 0 ?
              <FlatList
                data={notificationsList.notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => this.markSeenAndNavigate(item.id)}>
                    <View style={hqStyles.m1}>
                      {this.renderNotification(item)}
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View
                  style={{
                    borderBottomColor: ThemeService.getBorderColor(),
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                />}
                onEndReached={this.loadMore}
                ListFooterComponent={this.state.loadingMore ?
                  <HQActivityIndicator />
                  : (notificationsList.lastId === 0 && notificationsList.notifications.length > 40) &&
                  <HQText style={hqStyles.textAlignCenter}>
                    That's all, folks!
                  </HQText>
                }
              />
              :
              <>
                <HQHeader>No notifications yet.</HQHeader>
                <HQLabel>
                  Try watching some Tags, Questions or Answers to be notified of new posts under each.
                </HQLabel>
              </>
            }
          </>
        }
      </View>
    );
  }

  private renderNotification(notification: NotificationModel) {
    switch (notification.type) {
      case 'Question': {
        return (
          <>
            <HQText>
              {!notification.seen && 'NEW: '}Question
              {notification.tags.length > 0 ? ' in: ' + notification.tags.map((x) => x.name).join(', ') : null}
            </HQText>
            <CircleIconCard type="Q" position="left">
              <View style={hqStyles.mt1}>
                <HQText>{notification.questionText}</HQText>
              </View>
            </CircleIconCard>
          </>
        );
      }
      case 'Answer': {
        return (
          <>
            <HQText>
              {!notification.seen && 'NEW: '}Answer to: {notification.questionText}
            </HQText>
            <CircleIconCard type="A" position="left">
              <View style={hqStyles.mt1}>
                <QuotationMarks size="large">
                  <HQText>{notification.answerText}</HQText>
                </QuotationMarks>
              </View>
            </CircleIconCard>
          </>
        );
      }
      case 'Comment': {
        return (
          <>
            <HQText>
              {!notification.seen && 'NEW: '}Comment on: {notification.questionText}
            </HQText>
            <QuotationMarks size="xsmall">
              <HQText>{notification.answerText}</HQText>
            </QuotationMarks>
            <HQCard>
              <View style={hqStyles.flexRow}>
                <View style={{ margin: 5 }}>
                  <AgreementLabel isAgree={notification.agreementRating === 'Agree'} showLabel={false} />
                </View>
                <View style={hqStyles.mv1}>
                  <HQText>{notification.commentText}</HQText>
                </View>
              </View>
            </HQCard>
          </>
        );
      }
      default: return null;
    }
  }

  private loadMore(): void {
    const { notificationsList: { lastId }, loadMoreNotifications } = this.props;
    if (lastId > 0 && !this.state.loadingMore) {
      this.setState({ loadingMore: true });
      loadMoreNotifications(lastId);
    }
  }

  private markSeenAndNavigate(notificationId): void {
    const notification = this.props.notificationsList.notifications.filter((x) => x.id === notificationId)[0];
    if (!notification.seen) {
      this.props.markAsSeen(notificationId);
    }
    switch (notification.type) {
      case 'Question': {
        const { questionId } = notification;
        const navProps: QuestionNavigationProps = { questionId };
        NavigationService.navigate('Question', navProps);
        break;
      }
      case 'Answer':
      case 'Comment': {
        const { questionId, answerId } = notification;
        const navProps: AnswerNavigationProps = { questionId, answerId };
        NavigationService.navigate('Answer', navProps);
        break;
      }
    }
  }
}

export default connect(
  (state: ApplicationState) => (state.notifications),
  NotificationsStore.actionCreators,
)(NotificationScreen);
