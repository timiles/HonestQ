export interface LoginFormModel {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginResponseModel {
    firstName: string;
    username: string;
    token: string;
}

export interface RegisterFormModel {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
}

export interface TopicListItemModel {
    urlFragment: string;
    name: string;
}

export interface GetTopicsListModel {
    topics: TopicListItemModel[];
}

export interface GetTopicModel {
    name: string;
    statements: StatementListItemModel[];
}

export interface StatementListItemModel {
    text: string;
}

export interface PostTopicFormModel {
    urlFragment: string;
    name: string;
}

export interface PostStatementFormModel {
    text: string;
}
