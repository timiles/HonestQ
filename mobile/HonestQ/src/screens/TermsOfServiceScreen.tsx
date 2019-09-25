import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenOptions } from 'react-navigation';
import { HQHeader, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import ThemeService from '../ThemeService';

export default class TermsOfServiceScreen extends React.Component {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Terms of service',
  };

  public render() {
    return (
      <ScrollView style={[ThemeService.getStyles().contentView, hqStyles.p1]}>
        <HQHeader style={hqStyles.mb1}>1. Terms</HQHeader>
        <HQText style={hqStyles.mb1}>
          By using the HonestQ app, you are agreeing to be bound by these terms of service,
          all applicable laws and regulations, and agree that you are responsible for
          compliance with any applicable local laws. If you do not agree with any of these terms,
          you are prohibited from using or accessing this site. The materials contained in this
          app are protected by applicable copyright and trademark law.
        </HQText>
        <HQHeader style={hqStyles.mb1}>2. Use License</HQHeader>
        <HQText style={hqStyles.mb1}>
          a. Permission is granted to temporarily download one copy of the materials
          (information or software) on HonestQ's app for personal, non-commercial transitory viewing only.
          This is the grant of a license, not a transfer of title, and under this license you may not:
        </HQText>
        <HQText style={hqStyles.mb1}>
          i. modify or copy the materials;
        </HQText>
        <HQText style={hqStyles.mb1}>
          ii. use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
        </HQText>
        <HQText style={hqStyles.mb1}>
          iii. attempt to decompile or reverse engineer any software contained in HonestQ's app;
        </HQText>
        <HQText style={hqStyles.mb1}>
          iv. remove any copyright or other proprietary notations from the materials; or
        </HQText>
        <HQText style={hqStyles.mb1}>
          v. transfer the materials to another person or "mirror" the materials on any other server.
        </HQText>
        <HQText style={hqStyles.mb1}>
          b. This license shall automatically terminate if you violate any of these restrictions
          and may be terminated by HonestQ at any time. Upon terminating your viewing of these
          materials or upon the termination of this license, you must destroy any downloaded
          materials in your possession whether in electronic or printed format.
        </HQText>
        <HQHeader style={hqStyles.mb1}>3. Disclaimer</HQHeader>
        <HQText style={hqStyles.mb1}>
          The materials on HonestQ's app are provided on an 'as is' basis. HonestQ makes no warranties,
          expressed or implied, and hereby disclaims and negates all other warranties including,
          without limitation, implied warranties or conditions of merchantability, fitness for a
          particular purpose, or non-infringement of intellectual property or other violation of rights.
        </HQText>
        <HQText style={hqStyles.mb1}>
          Further, HonestQ does not warrant or make any representations concerning the accuracy,
          likely results, or reliability of the use of the materials on its app or otherwise relating
          to such materials or on any sites linked to this app.
        </HQText>
        <HQHeader style={hqStyles.mb1}>4. Limitations</HQHeader>
        <HQText style={hqStyles.mb1}>
          In no event shall HonestQ or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or due to business interruption)
          arising out of the use or inability to use the materials on HonestQ's app,
          even if HonestQ or an HonestQ authorized representative has been notified orally or in writing
          of the possibility of such damage. Because some jurisdictions do not allow limitations on implied
          warranties, or limitations of liability for consequential or incidental damages,
          these limitations may not apply to you.
        </HQText>
        <HQHeader style={hqStyles.mb1}>5. Accuracy of materials</HQHeader>
        <HQText style={hqStyles.mb1}>
          The materials appearing on HonestQ's app could include technical, typographical, or
          photographic errors. HonestQ does not warrant that any of the materials on its app are accurate,
          complete or current. HonestQ may make changes to the materials contained on its app
          at any time without notice. However HonestQ does not make any commitment to update the materials.
        </HQText>
        <HQHeader style={hqStyles.mb1}>6. Links</HQHeader>
        <HQText style={hqStyles.mb1}>
          HonestQ has not reviewed all of the sites linked to its website and is not responsible for the
          contents of any such linked site. The inclusion of any link does not imply endorsement by HonestQ
          of the site. Use of any such linked website is at the user's own risk.
        </HQText>
        <HQHeader style={hqStyles.mb1}>7. Modifications</HQHeader>
        <HQText style={hqStyles.mb1}>
          HonestQ may revise these terms of service for its website at any time without notice. By using
          this website you are agreeing to be bound by the then current version of these terms of service.
        </HQText>
        <HQHeader style={hqStyles.mb1}>8. Governing Law</HQHeader>
        <HQText style={hqStyles.mb1}>
          These terms and conditions are governed by and construed in accordance with the laws of the
          United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts
          in that State or location.
        </HQText>
      </ScrollView>
    );
  }
}
