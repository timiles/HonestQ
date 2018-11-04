import { addTask, fetch } from 'domain-task';
import * as jwt_decode from 'jwt-decode';
import { LoggedInUserModel } from './server-models';

export function getJson<T>(url: string, loggedInUser: LoggedInUserModel | null | undefined): Promise<T> {
    const fetchTask = fetchJson<T>('GET', url, null, loggedInUser, false);
    // Register GET requests to be awaited during server-side rendering
    addTask(fetchTask);
    return fetchTask;
}

export function postJson<T>(
    url: string,
    model: any,
    loggedInUser: LoggedInUserModel | null | undefined,
    includeCredentials?: boolean): Promise<T> {

    return fetchJson<T>('POST', url, model, loggedInUser, includeCredentials!);
}

export function putJson<T>(
    url: string,
    model: any,
    loggedInUser: LoggedInUserModel | null | undefined): Promise<T> {

    return fetchJson<T>('PUT', url, model, loggedInUser, false);
}

export function deleteJson<T>(
    url: string,
    loggedInUser: LoggedInUserModel | null | undefined): Promise<T> {

    return fetchJson<T>('DELETE', url, null, loggedInUser, false);
}

function fetchJson<T>(
    method: string,
    url: string,
    model: any,
    loggedInUser: LoggedInUserModel | null | undefined,
    includeCredentials: boolean): Promise<T> {

    return new Promise((resolve, reject) => {
        const requestOptions: RequestInit = {
            headers: { 'Content-Type': 'application/json' },
            method,
        };

        if (model) {
            requestOptions.body = JSON.stringify(model);
        }
        if (loggedInUser) {
            requestOptions.headers = { ...requestOptions.headers, Authorization: 'Bearer ' + loggedInUser.token };
        }
        if (includeCredentials) {
            // This ensures cookie is stored (or expired) from response
            requestOptions.credentials = 'include';
        }

        const fetchTask = fetch(url, requestOptions)
            .then((response: Response) => {
                if (response.ok) {
                    // return json if it was returned in the response
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.indexOf('application/json') >= 0) {
                        response.json().then((json) => resolve(json as T));
                    } else {
                        resolve();
                    }
                } else {
                    // return error message from response body
                    response.text().then((text) => {
                        if (text) {
                            reject(text);
                        } else {
                            switch (response.status) {
                                case 500:
                                    reject('An unexpected error has occurred. If it persists, please contact support.');
                                    break;
                                default:
                                    reject(response.statusText);
                            }
                        }
                    });
                }
            }, (reason: any) => {
                reject(reason.toString());
            })
            .catch((reason: any) => {
                reject(reason.toString());
            });
    });
}

export function isUserInRole(loggedInUser: LoggedInUserModel | undefined, role: string): boolean {
    if (!loggedInUser || !loggedInUser.token) {
        return false;
    }
    const decodedToken = jwt_decode(loggedInUser.token) as any;
    // If jwt has a single value, it's a string, or if multiple values it's an array
    return typeof (decodedToken.role) === 'string' && decodedToken.role === role ||
        typeof (decodedToken.role) === 'object' && decodedToken.role.indexOf(role) >= 0;
}

// tslint:disable-next-line:max-line-length
const urlMatchingRegExp = new RegExp(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/im);
export function extractUrlFromText(text: string): string | null {
    const match = urlMatchingRegExp.exec(text);
    if (match) {
        return match[0];
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
