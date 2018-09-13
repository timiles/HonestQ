export interface LoggedInUserModel {
    firstName: string;
    username: string;
    token: string;
    timeZoneOffsetHours: number;
}

export interface LoginFormModel {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterFormModel {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
}

export interface IntroModel {
    content: string;
}

export interface CommentFormModel {
    text: string;
    source: string;
    agreementRating: string;
    parentCommentId: number | null;
}

export interface CommentModel {
    id: number;
    text: string;
    source: string;
    agreementRating: string;
    postedAt: string;
    postedByUserPseudoId: number;
    isPostedByLoggedInUser: boolean;
    parentCommentId: number | null;
    comments: CommentModel[];
}

export interface PopFormModel {
    text: string;
    source: string;
    type: string;
    topics: TopicStanceModel[];
}

export interface PopListItemModel {
    id: number;
    slug: string;
    text: string;
    type: string;
    topics: TopicValueStanceModel[];
    agreementRatings: { [key: string]: number };
}

export interface PopModel {
    slug: string;
    text: string;
    source: string;
    type: string;
    isPostedByLoggedInUser: boolean;
    topics: TopicValueStanceModel[];
    comments: CommentModel[];
}

export interface PopsListModel {
    pops: PopListItemModel[];
}

export interface TopicStanceModel {
    slug: string;
    stance?: string;
}

export interface TopicValueStanceModel {
    stance?: string;
    name: string;
    slug: string;
}

export interface AdminTopicModel {
    isApproved: boolean;
    slug: string;
    name: string;
    summary: string;
    moreInfoUrl: string;
    pops: PopListItemModel[];
}

export interface EditTopicFormModel {
    slug: string;
    name: string;
    summary: string;
    moreInfoUrl: string;
    isApproved: boolean;
}

export interface TopicAutocompleteResultsModel {
    values: TopicValueModel[];
}

export interface TopicFormModel {
    name: string;
    summary: string;
    moreInfoUrl: string;
}

export interface TopicModel {
    slug: string;
    name: string;
    summary: string;
    moreInfoUrl: string;
    pops: PopListItemModel[];
}

export interface TopicListItemModel {
    slug: string;
    name: string;
}

export interface TopicsListModel {
    topics: TopicListItemModel[];
}

export interface TopicValueModel {
    name: string;
    slug: string;
}
