import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { QuestionListItemModel, QuestionSearchResultsModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as QuestionSearchStore from '../../store/QuestionSearch';
import { buildQuestionUrl } from '../../utils/route-utils';

interface OwnProps {
    containerClassName?: string;
    query: string;
}
type Props = QuestionSearchStore.QuestionSearchState
    & typeof QuestionSearchStore.actionCreators
    & OwnProps;

interface State {
    searchResults?: QuestionSearchResultsModel;
}

class QuestionSearchResults extends React.Component<Props, State> {

    private readonly inputDelayMilliseconds = 500;
    private waitForInputTimeoutId: number | null = null;

    constructor(props: Props) {
        super(props);

        this.state = { searchResults: props.searchResults };
    }

    public componentWillReceiveProps(nextProps: Props) {
        if (nextProps.query !== this.props.query) {
            // Wait for user to have stopped typing before firing event
            if (this.waitForInputTimeoutId) {
                clearTimeout(this.waitForInputTimeoutId);
            }
            // If the query was cleared, dispatch immediately
            const delay = (!nextProps.query) ? 0 : this.inputDelayMilliseconds;
            this.waitForInputTimeoutId = setTimeout((q: string): void => {
                this.props.searchQuestions(q);
            }, delay, nextProps.query);
        }

        this.setState({ searchResults: nextProps.searchResults });
    }

    public componentWillUnmount() {
        this.props.clear();
    }

    public render() {
        const { containerClassName } = this.props;
        const { searchResults } = this.state;

        if (!searchResults || searchResults.questions.length === 0) {
            return null;
        }

        return (
            <div className={containerClassName}>
                <h6>Related questions?</h6>
                <ul className="list-unstyled">
                    {searchResults.questions.map((x: QuestionListItemModel, i: number) =>
                        <li key={i} className="mb-2">
                            <Link
                                to={buildQuestionUrl(x.id, x.slug)}
                                className="btn btn-sm btn-outline-secondary post-list-item"
                            >
                                <span className="ml-1 quote-marks">{x.text}</span>
                            </Link>
                        </li>)}
                </ul>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: OwnProps) => ({ ...state.questionSearch, ...ownProps }),
    QuestionSearchStore.actionCreators,
)(QuestionSearchResults);
