export interface LoggedInUserModel {
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
    topics: TopicValueModel[];
}

export interface ActivityListModel {
    activityItems: ActivityListItemModel[];
    lastTimestamp: number;
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
    postedBy: string;
    postedByUserPseudoId: number;
    isPostedByLoggedInUser: boolean;
    comments: CommentModel[];
    reactionCounts: { [key: string]: number };
    myReactions: string[];
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
    postedBy: string;
    isPostedByLoggedInUser: boolean;
    topics: TopicValueModel[];
    answers: AnswerModel[];
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
