import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import IconCard from '../components/IconCard';
import NewLabel from '../components/NewLabel';
import NotificationsCount from '../components/NotificationsCount';
import QuotationMarks from '../components/QuotationMarks';
import { HQActivityIndicator, HQHeader, HQLabel, HQLoadingView, HQNavigationButton, HQText } from '../hq-components';
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
    headerRight: (
      <View style={hqStyles.mr1}>
        <NotificationsCount />
      </View>
    ),
  };

  constructor(props: Props) {
    super(props);

    this.state = { loadingMore: false };

    this.loadMore = this.loadMore.bind(this);
  }

  public componentDidMount() {
    if (!this.props.notificationsList) {
      this.props.loadMoreNotifications();
    }
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
            ListEmptyComponent={
              <View style={hqStyles.m1}>
                <HQHeader>No notifications yet.</HQHeader>
                <HQLabel style={hqStyles.mb1}>
                  Try watching some Tags, Questions or Answers to be notified of new posts under each.
                </HQLabel>
                <HQNavigationButton title="Browse all Tags" onPress={this.navigateToAllTags} />
              </View>
            }
            ListFooterComponent={this.state.loadingMore ?
              <HQActivityIndicator />
              : (notificationsList.lastId === 0 && notificationsList.notifications.length > 40) &&
              <HQText style={hqStyles.textAlignCenter}>
                That's all, folks!
              </HQText>
            }
          />
        }
      </View>
    );
  }

  private renderNotification(notification: NotificationModel) {
    switch (notification.type) {
      case 'Question': {
        return (
          <>
            <View style={[hqStyles.row, hqStyles.mb1]}>
              {!notification.seen && <NewLabel style={hqStyles.mr1} />}
              <HQText style={hqStyles.fillSpace}>
                Question
                {notification.tags.length > 0 ? ' in: ' + notification.tags.map((x) => x.name).join(', ') : null}
              </HQText>
            </View>
            <IconCard type="Q">
              <HQText>{notification.questionText}</HQText>
            </IconCard>
          </>
        );
      }
      case 'Answer': {
        return (
          <>
            <View style={[hqStyles.row, hqStyles.mb1]}>
              {!notification.seen && <NewLabel style={hqStyles.mr1} />}
              <HQText style={hqStyles.fillSpace}>
                Answer to: {notification.questionText}
              </HQText>
            </View>
            <IconCard type="A">
              <QuotationMarks size="large">
                <HQText>{notification.answerText}</HQText>
              </QuotationMarks>
            </IconCard>
          </>
        );
      }
      case 'Comment': {
        return (
          <>
            <View style={[hqStyles.row, hqStyles.mb1]}>
              {!notification.seen && <NewLabel style={hqStyles.mr1} />}
              <HQText style={hqStyles.fillSpace}>
                Comment on: {notification.questionText}
              </HQText>
            </View>
            <QuotationMarks size="xsmall">
              <HQText>{notification.answerText}</HQText>
            </QuotationMarks>
            <IconCard type={notification.agreementRating === 'Agree' ? 'Agree' : 'Disagree'}>
              <HQText>{notification.commentText}</HQText>
            </IconCard>
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

  private markSeenAndNavigate(notificationId: number): void {
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

  private navigateToAllTags(): void {
    NavigationService.navigate('AllTags');
  }
}

export default connect(
  (state: ApplicationState) => (state.notifications),
  NotificationsStore.actionCreators,
)(NotificationScreen);
