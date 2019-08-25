const websiteRoot = 'https://www.honestq.com';

export function buildTagUrl(slug: string): string {
  return `${websiteRoot}/tag/${slug}`;
}

export function buildQuestionUrl(
  id: number | string,
  slug: string): string {
  return `${websiteRoot}/questions/${id}/${slug}`;
}

export function buildAnswerUrl(
  questionId: number | string,
  questionSlug: string,
  answerId: number | string,
  answerSlug: string): string {
  return `${websiteRoot}/questions/${questionId}/${questionSlug}/${answerId}/${answerSlug}`;
}
