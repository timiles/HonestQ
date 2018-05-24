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

export interface StatementFormModel {
    text: string;
}

export interface StatementListItemModel {
    text: string;
}

export interface TopicFormModel {
    urlFragment: string;
    name: string;
}

export interface TopicModel {
    name: string;
    statements: StatementListItemModel[];
}

export interface TopicListItemModel {
    urlFragment: string;
    name: string;
}

export interface TopicsListModel {
    topics: TopicListItemModel[];
}
