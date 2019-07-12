import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import NavigationService from '../NavigationService';
import { LoggedInUserModel, PushTokenModel } from '../server-models';
import { postJson } from './http-utils';

export async function registerForPushNotificationsAsync(loggedInUser?: LoggedInUserModel) {

  const { status: initialStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

  if (initialStatus !== 'granted') {
    // Android remote notification permissions are granted during the app install, so this will only ask on iOS.
    const { status: askStatus } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

    // If still not granted, stop here.
    if (askStatus !== 'granted') {
      return;
    }
  }

  // Get the token that uniquely identifies this device
  const pushToken = await Notifications.getExpoPushTokenAsync();
  const payload: PushTokenModel = { pushToken };

  return postJson('/api/notifications/pushtoken', payload, loggedInUser)
    .catch((reason: string) => {
      // TODO log
    });
}

// Not sure why this isn't exported from expo Notifications?
// tslint:disable-next-line:interface-over-type-literal
declare type Notification = {
  origin: 'selected' | 'received';
  data: any;
  remote: boolean;
  isMultiple: boolean;
};
export function handleNotification(notification: Notification) {
  if (notification.origin === 'selected') {
    const { routeName, params } = notification.data;
    if (routeName) {
      NavigationService.navigate(routeName, params);
    }
  }
}
