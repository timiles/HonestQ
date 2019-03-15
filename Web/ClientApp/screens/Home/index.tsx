import * as React from 'react';
import { connect } from 'react-redux';
import WelcomeMessage from '../../components/Home/WelcomeMessage';
import QuestionSearchControl from '../../components/QuestionSearch/QuestionSearchControl';
import TagsList from '../../components/Tags/List';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';

interface Props { loggedInUser: LoggedInUserModel; }

class Index extends React.Component<Props> {

    public render() {
        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                <div className="nature-background">
                    <div className="homepage-circle-background">
                        <div className="container">
                            <WelcomeMessage />
                            <div className="row text-center">
                                <div className="col-md-6 offset-md-3">
                                    <QuestionSearchControl />
                                    <p className="welcome-message or-browse-by-tag">Or browse by Tags</p>
                                    <TagsList buttonSize="md" numberOfTagsToShow={11} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }
}

export default connect((state: ApplicationState, ownProps: any): any => (state.login))(Index);
