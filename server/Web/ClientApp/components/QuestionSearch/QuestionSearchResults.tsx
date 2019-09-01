import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { QuestionListItemModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as QuestionSearchStore from '../../store/QuestionSearch';
import { buildQuestionUrl } from '../../utils/route-utils';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';
import PaginationControl from '../shared/PaginationControl';

interface OwnProps {
  containerClassName?: string;
  headerText?: string;
  hideWhenNoResults?: boolean;
  query: string;
}
type Props = QuestionSearchStore.QuestionSearchState
  & typeof QuestionSearchStore.actionCreators
  & OwnProps
  & {
    searchQuestionsStatus: ActionStatus,
  };

class QuestionSearchResults extends React.Component<Props> {

  private readonly inputDelayMilliseconds = 500;
  private waitForInputTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.query !== prevProps.query) {
      // Wait for user to have stopped typing before firing event
      if (this.waitForInputTimeoutId) {
        clearTimeout(this.waitForInputTimeoutId);
      }
      // If the query was cleared, dispatch immediately
      const delay = (!this.props.query) ? 0 : this.inputDelayMilliseconds;
      this.waitForInputTimeoutId = setTimeout((q: string): void => {
        this.props.searchQuestions(q, 1, 5);
      }, delay, this.props.query);
    }
  }

  public componentWillUnmount() {
    this.props.clear();
  }

  public render() {
    const { containerClassName, headerText, searchResults, hideWhenNoResults } = this.props;

    if ((!headerText && !searchResults) ||
      (hideWhenNoResults && (!searchResults || searchResults.questions.length === 0))) {
      return <ActionStatusDisplay {...this.props.searchQuestionsStatus} />;
    }

    return (
      <div className={`question-search-results ${containerClassName}`}>
        {headerText &&
          <h6>{headerText}</h6>
        }
        <ActionStatusDisplay {...this.props.searchQuestionsStatus} />
        {searchResults &&
          <>
            <PaginationControl {...searchResults} onPageChange={this.handlePageChange} />
            {searchResults.questions.length > 0 &&
              <ul className="list-unstyled mb-0">
                {searchResults.questions.map((x: QuestionListItemModel, i: number) =>
                  <li key={i} className="mt-2">
                    <Link
                      to={buildQuestionUrl(x.id, x.slug)}
                      className="btn btn-sm btn-outline-secondary post-list-item"
                    >
                      <span className="ml-1">{x.text}</span>
                    </Link>
                  </li>)}
              </ul>
              ||
              <p className="mb-0"><i>No questions found related to "{searchResults.query}".</i></p>
            }
          </>
        }
      </div>
    );
  }

  private handlePageChange(nextPageNumber: number): void {
    const { query, pageSize } = this.props.searchResults!;
    this.props.searchQuestions(query, nextPageNumber, pageSize);
  }
}

export default connect(
  (state: ApplicationState, ownProps: OwnProps) => ({
    ...state.questionSearch,
    ...ownProps,
    searchQuestionsStatus: getActionStatus(state, 'QUESTION_SEARCH'),
  }),
  QuestionSearchStore.actionCreators,
)(QuestionSearchResults);
