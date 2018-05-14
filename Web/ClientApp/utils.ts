export function handleResponse<T>(response: Response): Promise<T> {
    return new Promise((resolve, reject) => {
        if (response.ok) {
            // return json if it was returned in the response
            var contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                response.json().then(json => resolve(json as T));
            } else {
                resolve();
            }
        } else {
            // return error message from response body
            response.text().then(text => reject(text));
        }
    });
}

export function handleError(error: any) {
    return Promise.reject(error && error.message);
}
