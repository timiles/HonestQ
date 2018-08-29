import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { PopFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as EditPopStore from '../../store/EditPop';
import Loading from '../shared/Loading';
import PopForm from '../Topic/PopForm';

type EditPopProps = EditPopStore.EditPopState
    & typeof EditPopStore.actionCreators
    & RouteComponentProps<{ topicSlug: string, popId: number }>;

class EditPop extends React.Component<EditPopProps, {}> {

    constructor(props: EditPopProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        if (this.shouldGetPop()) {
            this.props.getPop(this.props.match.params.popId);
        }
    }

    public render() {
        const { savedSlug } = this.props;
        const { initialState } = this.props.editPopForm;
        const successUrl = (savedSlug) ? `/pops/${this.props.match.params.popId}/${savedSlug}` : null;

        return (
            <div className="col-lg-6 offset-lg-3">
                <h2>Edit Pop</h2>
                {successUrl && (
                    <div className="alert alert-success" role="alert">
                        Pop updated, check it out: <Link to={successUrl}>{successUrl}</Link>
                    </div>
                )}
                <Loading {...this.props.editPopForm} />
                {initialState && (
                    <PopForm
                        initialState={initialState}
                        hideInfoBox={true}
                        submit={this.handleSubmit}
                    />
                )}
            </div>
        );
    }

    private shouldGetPop(): boolean {
        return (!this.props.editPopForm.initialState);
    }

    private handleSubmit(form: PopFormModel): void {
        this.props.submit(this.props.match.params.popId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.editPop),
    EditPopStore.actionCreators,
)(EditPop);
