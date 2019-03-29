export interface LoggedInUserModel {
    id: number;
    username: string;
    token: string;
    timeZoneOffsetHours: number;
}

export interface LogInFormModel {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface SignUpFormModel {
    email: string;
    username: string;
    password: string;
}

export interface VerifyEmailFormModel {
    userId: number;
    emailVerificationToken: string;
}

export interface VerifyEmailResponseModel {
    username: string;
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
    tags: TagValueModel[];
}

export interface ActivityListModel {
    activityItems: ActivityListItemModel[];
    lastTimestamp: number;
}

export interface NotificationModel {
    id: number;
    seen: boolean;
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
    agreementRating?: string;
    tags: TagValueModel[];
}

export interface NotificationsCountModel {
    count: number;
}

export interface NotificationsListModel {
    notifications: NotificationModel[];
    lastId: number;
}

export interface WatchResponseModel {
    watching: boolean;
}

export interface AdminQuestionFormModel {
    isApproved: boolean;
    text: string;
    source?: string;
    tags: TagValueFormModel[];
}

export interface AdminQuestionModel {
    isApproved: boolean;
    slug: string;
    text: string;
    source?: string;
    postedBy: string;
    watching: boolean;
    tags: TagValueModel[];
    answers: AnswerModel[];
}

export interface AnswerFormModel {
    text: string;
}

export interface AnswerModel {
    id: number;
    text: string;
    slug: string;
    postedAt: string;
    postedBy: string;
    postedByUserPseudoId: number;
    comments: CommentModel[];
    reactionCounts: { [key: string]: number };
    myReactions: string[];
    watching: boolean;
}

export interface CommentFormModel {
    text: string;
    source?: string;
    agreementRating: string;
    parentCommentId?: number;
    isAnonymous: boolean;
}

export interface CommentModel {
    id: number;
    text: string;
    source?: string;
    agreementRating: string;
    postedAt: string;
    postedBy: string;
    status: string;
    parentCommentId?: number;
    comments: CommentModel[];
    reactionCounts: { [key: string]: number };
    myReactions: string[];
    watching: boolean;
}

export interface TagValueFormModel {
    slug: string;
}

export interface QuestionFormModel {
    text: string;
    source?: string;
    tags: TagValueFormModel[];
}

export interface QuestionListItemModel {
    id: number;
    slug: string;
    text: string;
    tags: TagValueModel[];
    answersCount: number;
}

export interface QuestionModel {
    slug: string;
    text: string;
    source?: string;
    postedBy: string;
    watching: boolean;
    tags: TagValueModel[];
    answers: AnswerModel[];
}

export interface QuestionSearchResultsModel {
    query: string;
    pageNumber: number;
    pageSize: number;
    questions: QuestionListItemModel[];
    more: boolean;
}

export interface QuestionsListModel {
    questions: QuestionListItemModel[];
    lastTimestamp: number;
}

export interface ReactionModel {
    questionId: number;
    answerId: number;
    commentId?: number;
    type: string;
    newCount: number;
    isMyReaction: boolean;
}

export interface AdminTagModel {
    isApproved: boolean;
    slug: string;
    name: string;
    description?: string;
    moreInfoUrl?: string;
    watching: boolean;
    questions: QuestionListItemModel[];
}

export interface EditTagFormModel {
    slug: string;
    name: string;
    description?: string;
    moreInfoUrl?: string;
    isApproved: boolean;
}

export interface TagAutocompleteResultsModel {
    values: TagValueModel[];
}

export interface TagFormModel {
    name: string;
    description?: string;
    moreInfoUrl?: string;
}

export interface TagModel {
    slug: string;
    name: string;
    description?: string;
    moreInfoUrl?: string;
    watching: boolean;
    questions: QuestionListItemModel[];
}

export interface TagListItemModel {
    slug: string;
    name: string;
}

export interface TagsListModel {
    tags: TagListItemModel[];
}

export interface TagValueModel {
    name: string;
    slug: string;
}
