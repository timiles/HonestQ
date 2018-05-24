import { addTask, fetch } from 'domain-task';
import * as jwt_decode from 'jwt-decode';
import { LoggedInUserModel } from './server-models';

export function getJson<T>(url: string): Promise<T> {
    const fetchTask = fetchJson<T>('GET', url, null, null, false);
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
                    if (contentType && contentType.includes('application/json')) {
                        response.json().then((json) => resolve(json as T));
                    } else {
                        resolve();
                    }
                } else {
                    // return error message from response body
                    response.text().then((text) => reject(text));
                }
            }, (reason: any) => {
                reject(reason.toString());
            })
            .catch((reason: any) => {
                reject(reason.toString());
            });
    });
}

export function isUserInRole(loggedInUser: LoggedInUserModel, role: string): boolean {
    if (!loggedInUser || !loggedInUser.token) {
        return false;
    }
    const decodedToken = jwt_decode(loggedInUser.token) as any;
    // If jwt has a single value, it's a string, or if multiple values it's an array
    return typeof (decodedToken.role) === 'string' && decodedToken.role === role ||
        typeof (decodedToken.role) === 'object' && decodedToken.role.indexOf(role) >= 0;
}
