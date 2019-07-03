import { NavigationActions, NavigationContainerComponent, NavigationParams } from 'react-navigation';

export default class NavigationService {

  public static setTopLevelNavigator(navigatorRef: NavigationContainerComponent) {
    this.navigator = navigatorRef;
  }

  public static navigate(routeName: string, params?: NavigationParams) {
    this.navigator.dispatch(NavigationActions.navigate({ routeName, params }));
  }

  public static goBack() {
    this.navigator.dispatch(NavigationActions.back());
  }

  private static navigator: NavigationContainerComponent;
}
