export function parseQueryString(queryString: string): Map<string, string> {
    const values = new Map<string, string>();
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (const pair of pairs) {
        const split = pair.split('=');
        // WARNING: This will overwrite in the case of a repeated value. Not an issue yet.
        values.set(decodeURIComponent(split[0]), decodeURIComponent(split[1] || ''));
    }
    return values;
}

export function buildQuestionUrl(
    id: number | string,
    slug: string): string {
    return `/questions/${id}/${slug}`;
}

export function buildAnswerUrl(
    questionId: number | string,
    questionSlug: string,
    answerId: number | string,
    answerSlug: string): string {
    return `/questions/${questionId}/${questionSlug}/${answerId}/${answerSlug}`;
}
