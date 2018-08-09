import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as StatementStore from '../../store/Statement';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Statement from './Statement';

type ContainerProps = StatementStore.ContainerState
    & typeof StatementStore.actionCreators
    & { loggedInUser: LoggedInUserModel | undefined }
    // Important: statementId cannot be number as would still be a string in the underlying JavaScript?
    & RouteComponentProps<{ statementId: string }>;

class Container extends React.Component<ContainerProps, {}> {

    constructor(props: ContainerProps) {
        super(props);
    }

    public componentWillMount() {
        // This will also run on server side render
        if (this.shouldGetStatement()) {
            this.props.getStatement(Number(this.props.match.params.statementId));
        }
    }

    public render() {
        const { statement } = this.props;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {this.renderHelmetTags()}

                {statement &&
                    <div className="col-lg-6 offset-lg-3">
                        <div className="row">
                            <div className="col-md-12">
                                <Statement {...statement} />
                            </div>
                        </div>
                    </div>
                }
            </LoggedInUserContext.Provider>
        );
    }

    private renderHelmetTags() {
        const { statement } = this.props;

        const pageTitleParts = ['POBS'];
        const canonicalUrlParts = ['https://pobs.local'];

        if (this.props.match.params.statementId && statement && statement.model) {
            pageTitleParts.push('\u201C' + statement.model.text + '\u201D');
            canonicalUrlParts.push(statement.statementId!.toString());
            canonicalUrlParts.push(statement.model.slug);
        }

        const pageTitle = pageTitleParts.join(' » ');
        const canonicalUrl = canonicalUrlParts.join('/');

        return (
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="canonical" href={canonicalUrl} />
            </Helmet>
        );
    }

    private shouldGetStatement(): boolean {
        if (!this.props.match.params.statementId) {
            return false;
        }
        const statementIdAsNumber = Number(this.props.match.params.statementId);
        if (isNaN(statementIdAsNumber)) {
            return false;
        }
        if (!this.props.statement) {
            return true;
        }
        if (this.props.statement.loading) {
            return false;
        }
        return (this.props.statement.statementId !== statementIdAsNumber);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.statement, loggedInUser: state.login.loggedInUser }),
    StatementStore.actionCreators,
)(Container);
