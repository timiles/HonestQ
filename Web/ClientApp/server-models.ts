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
    postedByUsername: string;
    parentCommentId: number | null;
    comments: CommentModel[];
}

export interface StatementFormModel {
    text: string;
    source: string;
    stance: string;
    topicSlugs: string[];
}

export interface StatementListItemModel {
    id: number;
    slug: string;
    text: string;
    stance: string;
    topics: TopicLabelModel[];
    agreementRatings: { [key: string]: number };
}

export interface StatementModel {
    slug: string;
    text: string;
    source: string;
    stance: string;
    topics: TopicLabelModel[];
    comments: CommentModel[];
}

export interface TopicLabelModel {
    name: string;
    slug: string;
}

export interface AdminTopicModel {
    isApproved: boolean;
    slug: string;
    name: string;
    summary: string;
    moreInfoUrl: string;
    statements: StatementListItemModel[];
}

export interface EditTopicFormModel {
    slug: string;
    name: string;
    summary: string;
    moreInfoUrl: string;
    isApproved: boolean;
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
