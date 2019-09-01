import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import Container from '../../components/Tag/Container';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';

type Props = { loggedInUser: LoggedInUserModel | undefined }
  & RouteComponentProps<{ tagSlug: string }>;

class Item extends React.Component<Props> {

  public render() {
    const { tagSlug } = this.props.match.params;

    return (
      <LoggedInUserContext.Provider value={this.props.loggedInUser}>
        <Container key={tagSlug} tagSlug={tagSlug} />
      </LoggedInUserContext.Provider>
    );
  }
}

export default connect((state: ApplicationState, ownProps: any): any => (state.login))(Item);
