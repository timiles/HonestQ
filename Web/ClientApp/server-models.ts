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
    agreementRating: string;
}

export interface CommentListItemModel {
    id: number;
    text: string;
    agreementRating: string;
    postedAt: string;
    postedByUsername: string;
}

export interface EditTopicFormModel {
    slug: string;
    name: string;
    summary: string;
    moreInfoUrl: string;
    isApproved: boolean;
}

export interface StatementFormModel {
    text: string;
}

export interface StatementListItemModel {
    id: number;
    slug: string;
    text: string;
}

export interface StatementModel {
    slug: string;
    text: string;
    comments: CommentListItemModel[];
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
    statements: StatementListItemModel[];
}

export interface TopicListItemModel {
    slug: string;
    name: string;
}

export interface TopicsListModel {
    topics: TopicListItemModel[];
}
