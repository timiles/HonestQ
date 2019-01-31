import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { QuestionListItemModel, QuestionSearchResultsModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as QuestionSearchStore from '../../store/QuestionSearch';
import { buildQuestionUrl } from '../../utils/route-utils';
import PaginationControl from '../shared/PaginationControl';

interface OwnProps {
    containerClassName?: string;
    headerText?: string;
    hideWhenNoResults?: boolean;
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

        this.handlePageChange = this.handlePageChange.bind(this);
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
                this.props.searchQuestions(q, 1, 5);
            }, delay, nextProps.query);
        }

        this.setState({ searchResults: nextProps.searchResults });
    }

    public componentWillUnmount() {
        this.props.clear();
    }

    public render() {
        const { containerClassName, headerText, hideWhenNoResults } = this.props;
        const { searchResults } = this.state;

        if (!searchResults || (searchResults.questions.length === 0 && hideWhenNoResults)) {
            return null;
        }

        return (
            <div className={containerClassName}>
                {headerText &&
                    <h6>{headerText}</h6>
                }
                <PaginationControl {...searchResults} onPageChange={this.handlePageChange} />
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
                {searchResults.questions.length === 0 &&
                    <p><i>No questions found related to "{searchResults.query}".</i></p>
                }
            </div>
        );
    }

    private handlePageChange(nextPageNumber: number): void {
        const { query, pageSize } = this.state.searchResults!;
        this.props.searchQuestions(query, nextPageNumber, pageSize);
    }
}

export default connect(
    (state: ApplicationState, ownProps: OwnProps) => ({ ...state.questionSearch, ...ownProps }),
    QuestionSearchStore.actionCreators,
)(QuestionSearchResults);
