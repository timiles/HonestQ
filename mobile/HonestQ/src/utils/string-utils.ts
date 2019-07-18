function createUrlRegExp(): RegExp {
  // tslint:disable-next-line:max-line-length
  return new RegExp(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim);
}

export function splitIntoAlternatingTextFragmentsAndUrls(text: string): string[] {
  const urlMatchingRegExp = createUrlRegExp();
  const parts = new Array<string>();
  let lastIndex = 0;
  let regExpResult = urlMatchingRegExp.exec(text);
  while (regExpResult) {
    // Start with text fragment, even if it's empty
    parts.push(text.substring(lastIndex, regExpResult.index));
    parts.push(regExpResult[0]);
    lastIndex = urlMatchingRegExp.lastIndex;
    regExpResult = urlMatchingRegExp.exec(text);
  }
  // End with any remaining text fragment, even if it's empty
  parts.push(text.substring(lastIndex));
  return parts;
}

export function extractUrlsFromText(text: string): string[] {
  const urlMatchingRegExp = createUrlRegExp();
  const urls = new Array<string>();
  let regExpResult = urlMatchingRegExp.exec(text);
  while (regExpResult) {
    urls.push(regExpResult[0]);
    regExpResult = urlMatchingRegExp.exec(text);
  }
  return urls;
}

const domainFromUrlRegExp = new RegExp(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/im);
export function extractDomainFromUrl(url: string): string | null {
  const match = domainFromUrlRegExp.exec(url);
  if (match) {
    return match[1];
  }
  return null;
}

export function extractExtensionFromUrl(url: string): string | null {
  const urlWithoutQueryString = url.split('?')[0];
  const urlPartsSplitOnDot = urlWithoutQueryString.split('.');
  if (urlPartsSplitOnDot.length < 2) {
    return null;
  }
  return urlPartsSplitOnDot[urlPartsSplitOnDot.length - 1].toLowerCase();
}

export function getItemCountText(itemName: string, count: number): string {
  switch (count) {
    case 0: {
      return `No ${itemName}s yet`;
    }
    case 1: {
      return `1 ${itemName}`;
    }
    default: {
      return `${count} ${itemName}s`;
    }
  }
}
