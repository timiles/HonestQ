import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as PopStore from '../../store/Pop';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Pop from './Pop';

type ContainerProps = PopStore.ContainerState
    & typeof PopStore.actionCreators
    & { loggedInUser: LoggedInUserModel | undefined }
    // Important: popId cannot be number as would still be a string in the underlying JavaScript?
    & RouteComponentProps<{ popId: string }>;

class Container extends React.Component<ContainerProps, {}> {

    constructor(props: ContainerProps) {
        super(props);
    }

    public componentWillMount() {
        // This will also run on server side render
        if (this.shouldGetPop()) {
            this.props.getPop(Number(this.props.match.params.popId));
        }
    }

    public render() {
        const { pop } = this.props;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {this.renderHelmetTags()}

                {pop &&
                    <div className="col-lg-6 offset-lg-3">
                        <div className="row">
                            <div className="col-md-12">
                                <Pop {...pop} />
                            </div>
                        </div>
                    </div>
                }
            </LoggedInUserContext.Provider>
        );
    }

    private renderHelmetTags() {
        const { pop } = this.props;

        const pageTitleParts = ['POBS'];
        const canonicalUrlParts = ['https://pobs.local'];

        if (this.props.match.params.popId && pop && pop.model) {
            pageTitleParts.push('\u201C' + pop.model.text + '\u201D');
            canonicalUrlParts.push(pop.popId!.toString());
            canonicalUrlParts.push(pop.model.slug);
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

    private shouldGetPop(): boolean {
        if (!this.props.match.params.popId) {
            return false;
        }
        const popIdAsNumber = Number(this.props.match.params.popId);
        if (isNaN(popIdAsNumber)) {
            return false;
        }
        if (!this.props.pop) {
            return true;
        }
        if (this.props.pop.loading) {
            return false;
        }
        return (this.props.pop.popId !== popIdAsNumber);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.pop, loggedInUser: state.login.loggedInUser }),
    PopStore.actionCreators,
)(Container);
