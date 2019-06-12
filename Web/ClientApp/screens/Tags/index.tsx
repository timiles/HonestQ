import React from 'react';
import { connect } from 'react-redux';
import TagsList from '../../components/Tags/List';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';

interface Props { loggedInUser: LoggedInUserModel; }

class Index extends React.Component<Props> {

    public componentDidMount() {
        window.scrollTo(0, 0);
    }

    public render() {
        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                <div className="cityscape-background">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 col-lg-6 offset-lg-3">
                                <h1>Browse Tags</h1>
                                <TagsList buttonSize="lg" showNewTagButton={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }
}

export default connect((state: ApplicationState, ownProps: any): any => (state.login))(Index);
