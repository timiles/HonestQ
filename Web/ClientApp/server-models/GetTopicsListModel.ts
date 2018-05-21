// tslint:disable:interface-name

export interface GetTopicsListModel {
    topics: TopicListItemModel[];
}

export interface TopicListItemModel {
    urlFragment: string;
    name: string;
}
