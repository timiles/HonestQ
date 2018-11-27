import { addTask, fetch } from 'domain-task';
import { LoggedInUserModel } from '../server-models';

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

export function fetchJson<T>(
    method: string,
    url: string,
    model: any,
    loggedInUser: LoggedInUserModel | null | undefined,
    includeCredentials: boolean = false): Promise<T> {

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
