function createUrlRegExp(flags: string): RegExp {
    // tslint:disable-next-line:max-line-length
    return new RegExp(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/, flags);
}

export function splitIntoAlternatingTextFragmentsAndUrls(text: string): string[] {
    const urlMatchingRegExp = createUrlRegExp('gim');
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

export function extractUrlFromText(text: string): string | null {
    const urlMatchingRegExp = createUrlRegExp('im');
    const match = urlMatchingRegExp.exec(text);
    if (match) {
        return match[0];
    }
    return null;
}

const domainFromUrlRegExp = new RegExp(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/im);
export function extractDomainFromUrl(url: string): string | null {
    const match = domainFromUrlRegExp.exec(url);
    if (match) {
        return match[1];
    }
    return null;
}

export function parseDateWithTimeZoneOffset(dateString: string, hoursOffset: number) {
    // If date from server ends with 'Z', javascript automatically applies the local time zone
    if (dateString && dateString[dateString.length - 1] === 'Z') {
        dateString = dateString.substring(0, dateString.length - 1);
    }
    const date = new Date(dateString);
    if (hoursOffset !== 0) {
        date.setTime(date.getTime() + (hoursOffset * 60 * 60 * 1000));
    }
    return date;
}
