import { showMessage } from 'react-native-flash-message';

export interface PopupOptions {
  title: string;
  message: string;
  durationMilliseconds?: number;
}

export function showPopup(options: PopupOptions) {
  showMessage({
    message: options.title,
    description: options.message,
    type: 'success',
    icon: 'success',
    floating: true,
    duration: options.durationMilliseconds || 1850,
  });
}
