import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { CommentModel, LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as PopStore from '../../store/Pop';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Answer from './Answer';
import BackToPopButton from './BackToPopButton';
import Pop from './Pop';
import Question from './Question';

type ContainerProps = PopStore.ContainerState
    & typeof PopStore.actionCreators
    & { loggedInUser: LoggedInUserModel | undefined }
    // Important: popId cannot be number as would still be a string in the underlying JavaScript?
    & RouteComponentProps<{ popId: string, commentId?: string }>;

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

        let comment: CommentModel | undefined;
        const commentId = Number(this.props.match.params.commentId);
        if (pop.model && commentId > 0) {
            comment = pop.model.comments.filter((x) => x.id === commentId)[0];
        }

        const slideDurationMilliseconds = 500;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {this.renderHelmetTags()}

                {pop &&
                    <>
                        <div className="col-lg-6 offset-lg-3">
                            <div className="row">
                                {(pop.loading || pop.error) &&
                                    <div className="col-md-12">
                                        {pop.loading &&
                                            <p>Loading...</p>}
                                        {pop.error &&
                                            <div className="alert alert-danger" role="alert">{pop.error}</div>}
                                    </div>
                                }
                                {pop.model && pop.model.type !== 'Question' &&
                                    <div className="col-md-12">
                                        <Pop {...pop} />
                                    </div>
                                }
                                {pop.model && pop.model.type === 'Question' &&
                                    <TransitionGroup component={undefined}>
                                        {!this.props.match.params.commentId &&
                                            <CSSTransition
                                                timeout={slideDurationMilliseconds}
                                                classNames="slide"
                                            >
                                                <div className="col-md-12 slide slide-left">
                                                    <Question {...pop} />
                                                </div>
                                            </CSSTransition>
                                        }
                                        {comment &&
                                            <CSSTransition
                                                timeout={slideDurationMilliseconds}
                                                classNames="slide"
                                            >
                                                <div className="col-md-12 slide slide-right">
                                                    <BackToPopButton
                                                        id={pop.popId!}
                                                        slug={pop.model.slug}
                                                        text={pop.model.text}
                                                    />
                                                    <Answer {...comment} popId={pop.popId!} />
                                                </div>
                                            </CSSTransition>
                                        }
                                    </TransitionGroup>
                                }
                            </div>
                        </div>
                    </>
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
