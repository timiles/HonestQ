export interface IAuthenticatedUser {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    token: string;
}

export class AuthHelper {
    public static login(user: IAuthenticatedUser): any {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
    }
}
