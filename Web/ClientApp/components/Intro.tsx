import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import * as Showdown from 'showdown';
import { ApplicationState } from '../store';
import * as IntroStore from '../store/Intro';

type IntroProps = IntroStore.IntroState
    & typeof IntroStore.actionCreators
    & RouteComponentProps<{}>;

class Intro extends React.Component<IntroProps, {}> {

    public componentWillMount() {
        if (!this.props.intro) {
            this.props.getIntro();
        }
    }

    public render() {
        const { loading, error, intro } = this.props;
        const introHtml = (intro) ? new Showdown.Converter().makeHtml(intro) : '';
        return (
            <div className="col-lg-6 offset-lg-3">
                {loading && <p>⏳ <i>Loading...</i></p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <div dangerouslySetInnerHTML={{ __html: introHtml }} />
                {!loading &&
                    <Link to={'/'} className="btn btn-lg btn-primary">Let's begin!</Link>
                }
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.intro }),
    IntroStore.actionCreators,
)(Intro);
