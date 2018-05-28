export interface LoggedInUserModel {
    firstName: string;
    username: string;
    token: string;
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

export interface CommentFormModel {
    text: string;
}

export interface CommentListItemModel {
    id: number;
    text: string;
    postedAt: Date;
    postedByUsername: string;
}

export interface StatementFormModel {
    text: string;
}

export interface StatementListItemModel {
    id: number;
    text: string;
}

export interface StatementModel {
    text: string;
    comments: CommentListItemModel[];
}

export interface TopicFormModel {
    slug: string;
    name: string;
}

export interface TopicModel {
    name: string;
    statements: StatementListItemModel[];
}

export interface TopicListItemModel {
    slug: string;
    name: string;
}

export interface TopicsListModel {
    topics: TopicListItemModel[];
}
