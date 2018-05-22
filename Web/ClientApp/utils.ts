import * as jwt_decode from 'jwt-decode';
import { LoginResponseModel } from './server-models';

export function handleResponse<T>(response: Response): Promise<T> {
    return new Promise((resolve, reject) => {
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
    });
}

export function handleError(error: any) {
    return Promise.reject(error && error.message);
}

export function isUserInRole(loggedInUser: LoginResponseModel, role: string): boolean {
    if (!loggedInUser || !loggedInUser.token) {
        return false;
    }
    const decodedToken = jwt_decode(loggedInUser.token) as any;
    // If jwt has a single value, it's a string, or if multiple values it's an array
    return typeof (decodedToken.role) === 'string' && decodedToken.role === role ||
        typeof (decodedToken.role) === 'object' && decodedToken.role.indexOf(role) >= 0;
}
