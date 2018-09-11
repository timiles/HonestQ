import * as React from 'react';
import { Link } from 'react-router-dom';
import { PopListItemModel, TopicValueModel } from '../../server-models';
import PopTypeView from '../shared/PopTypeView';
import AgreementRatingBarChart from './AgreementRatingBarChart';
import NewPop from './NewPop';
import PopTypeInput from './PopTypeInput';

interface Props {
    pops: PopListItemModel[];
    topicValue: TopicValueModel;
}

interface State {
    typeFilter?: string;
}

export default class PopList extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {};

        this.handleChangeTypeFilter = this.handleChangeTypeFilter.bind(this);
    }

    public render() {
        let { pops } = this.props;
        if (pops.length === 0) {
            return null;
        }
        const { topicValue } = this.props;
        const { typeFilter } = this.state;

        if (typeFilter) {
            pops = pops.filter((x) => x.type === typeFilter);
        }

        return (
            <>
                <form className="form-inline my-2 float-right">
                    <label className="my-1 mr-2">Filter</label>
                    <PopTypeInput includeAll={true} onChange={this.handleChangeTypeFilter} />
                </form>
                <ul className="list-unstyled">
                    {pops.map((x, i) =>
                        <li key={`pop_${i}`} className="mb-2">
                            <Link
                                to={`/pops/${x.id}/${x.slug}`}
                                className="btn btn-lg btn-outline-secondary pop-list-item"
                            >
                                <PopTypeView value={x.type} />
                                {this.renderStance(x, topicValue.slug)}
                                <span className={`pop pop-${x.type.toLowerCase()}`}>{x.text}</span>
                                {x.agreementRatings &&
                                    <span className="ml-1">
                                        <AgreementRatingBarChart {...x.agreementRatings} />
                                    </span>}
                            </Link>
                        </li>)}
                    <li>
                        <NewPop topicValue={topicValue} />
                    </li>
                </ul>
            </>);
    }

    private renderStance(model: PopListItemModel, topicSlug: string) {
        const topic = model.topics.filter((x) => x.slug === topicSlug)[0];
        if (topic && topic.stance) {
            return <span className={`stance stance-${topic.stance.toLowerCase()} stance-overlay`} />;
        }
        return null;
    }

    private handleChangeTypeFilter(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ typeFilter: event.currentTarget.value });
    }
}
