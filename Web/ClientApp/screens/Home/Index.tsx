import * as React from 'react';
import { connect } from 'react-redux';
import WelcomeMessage from '../../components/Home/WelcomeMessage';
import TagsList from '../../components/Tags/List';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';

interface Props { loggedInUser: LoggedInUserModel; }

class Index extends React.Component<Props> {

    public render() {
        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {!this.props.loggedInUser &&
                    <WelcomeMessage />
                }
                <div className="row">
                    <div className="col-md-12">
                        <TagsList buttonSize="md" showNewTagButton={true} />
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }
}

export default connect((state: ApplicationState, ownProps: any): any => (state.login))(Index);
