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

export interface ActivityListItemModel {
    type: string;
    questionId: number;
    questionSlug: string;
    questionText: string;
    answerId?: number;
    answerSlug?: string;
    answerText?: string;
    commentId?: number;
    commentText?: string;
    postedAt: string;
    childCount?: number;
    agreementRating?: string;
    topics: TopicValueModel[];
}

export interface ActivityListModel {
    activityItems: ActivityListItemModel[];
    lastTimestamp: number;
}

export interface IntroModel {
    content: string;
}

export interface AnswerFormModel {
    text: string;
    source?: string;
}

export interface AnswerModel {
    id: number;
    text: string;
    slug: string;
    source?: string;
    postedAt: string;
    postedByUserPseudoId: number;
    isPostedByLoggedInUser: boolean;
    comments: CommentModel[];
}

export interface CommentFormModel {
    text: string;
    source?: string;
    agreementRating: string;
    parentCommentId?: number;
}

export interface CommentModel {
    id: number;
    text?: string;
    source?: string;
    agreementRating: string;
    postedAt: string;
    postedByUserPseudoId: number;
    isPostedByLoggedInUser: boolean;
    parentCommentId?: number;
    comments: CommentModel[];
}

export interface TopicValueFormModel {
    slug: string;
}

export interface QuestionFormModel {
    text: string;
    source?: string;
    topics: TopicValueFormModel[];
}

export interface QuestionListItemModel {
    id: number;
    slug: string;
    text: string;
    topics: TopicValueModel[];
    answersCount: number;
}

export interface QuestionModel {
    slug: string;
    text: string;
    source?: string;
    isPostedByLoggedInUser: boolean;
    topics: TopicValueModel[];
    answers: AnswerModel[];
}

export interface QuestionsListModel {
    questions: QuestionListItemModel[];
}

export interface AdminTopicModel {
    isApproved: boolean;
    slug: string;
    name: string;
    summary?: string;
    moreInfoUrl?: string;
    questions: QuestionListItemModel[];
}

export interface EditTopicFormModel {
    slug: string;
    name: string;
    summary?: string;
    moreInfoUrl?: string;
    isApproved: boolean;
}

export interface TopicAutocompleteResultsModel {
    values: TopicValueModel[];
}

export interface TopicFormModel {
    name: string;
    summary: string;
    moreInfoUrl?: string;
}

export interface TopicModel {
    slug: string;
    name: string;
    summary?: string;
    moreInfoUrl?: string;
    questions: QuestionListItemModel[];
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
