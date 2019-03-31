import * as React from 'react';
import { TagModel } from '../../server-models';
import NewQuestion from '../QuestionForm/NewQuestion';
import TextWithShortLinks from '../shared/TextWithShortLinks';
import QuestionList from './QuestionList';

interface TagProps {
    tag: TagModel;
}

export default class Tag extends React.Component<TagProps, {}> {

    public render() {
        const { tag } = this.props;
        const { slug, name, description, moreInfoUrl, questions } = tag;
        const tagValue = { name, slug };
        return (
            <>
                {(description || moreInfoUrl) &&
                    <div className="bs-callout bs-callout-info">
                        {description &&
                            <>
                                <h4>Description</h4>
                                <p>{description}</p>
                            </>
                        }
                        {moreInfoUrl &&
                            <>
                                <h4>More info</h4>
                                <TextWithShortLinks value={moreInfoUrl} />
                            </>
                        }
                    </div>
                }
                {questions.length === 0 &&
                    <h2>Start the conversation</h2>
                }
                <div className="clearfix mb-3">
                    <div className="float-right">
                        <NewQuestion tagValue={tagValue} />
                    </div>
                </div>
                <QuestionList questions={questions} />
                {questions.length >= 5 &&
                    <div className="clearfix">
                        <div className="float-right">
                            <NewQuestion tagValue={tagValue} />
                        </div>
                    </div>
                }
            </>
        );
    }
}
