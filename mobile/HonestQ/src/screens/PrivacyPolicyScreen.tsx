import { Linking } from 'expo';
import React from 'react';
import { ScrollView } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import { HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import ThemeService from '../ThemeService';

export default class PrivacyPolicyScreen extends React.Component {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Privacy policy',
  };

  public render() {
    return (
      <ScrollView style={[ThemeService.getStyles().contentView, hqStyles.p1]}>
        <HQText style={hqStyles.mb1}>
          Your privacy is important to us. It is HonestQ's policy to respect your privacy
          regarding any information we may collect from you across our website, {}
          <HQText onPress={() => Linking.openURL('https://www.honestq.com')}>https://www.honestq.com</HQText>,
          and other sites and apps we own and operate.
        </HQText>
        <HQText style={hqStyles.mb1}>
          We only ask for personal information when we truly need it to provide a service to you.
          We collect it by fair and lawful means, with your knowledge and consent. We also let you
          know why we’re collecting it and how it will be used.
        </HQText>
        <HQText style={hqStyles.mb1}>
          We only retain collected information for as long as necessary to provide you with your
          requested service. What data we store, we’ll protect within commercially acceptable means
          to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.
        </HQText>
        <HQText style={hqStyles.mb1}>
          We don’t share any personally identifying information publicly or with third-parties,
          except when required to by law.
        </HQText>
        <HQText style={hqStyles.mb1}>
          Our website may link to external sites that are not operated by us. Please be aware that
          we have no control over the content and practices of these sites, and cannot accept
          responsibility or liability for their respective privacy policies.
        </HQText>
        <HQText style={hqStyles.mb1}>
          You are free to refuse our request for your personal information, with the understanding
          that we may be unable to provide you with some of your desired services.
        </HQText>
        <HQText style={hqStyles.mb1}>
          Your continued use of our website will be regarded as acceptance of our practices around
          privacy and personal information. If you have any questions about how we handle user
          data and personal information, feel free to contact us.
        </HQText>
        <HQText style={hqStyles.mb1}>
          This policy is effective as of 24 September 2019.
        </HQText>
      </ScrollView>
    );
  }
}
