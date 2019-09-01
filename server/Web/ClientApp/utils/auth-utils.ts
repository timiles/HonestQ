import jwt_decode from 'jwt-decode';
import { LoggedInUserModel } from '../server-models';

export function isUserInRole(loggedInUser: LoggedInUserModel | undefined, role: string): boolean {
  if (!loggedInUser || !loggedInUser.token) {
    return false;
  }
  const decodedToken = jwt_decode(loggedInUser.token) as any;
  // If jwt has a single value, it's a string, or if multiple values it's an array
  return typeof (decodedToken.role) === 'string' && decodedToken.role === role ||
    typeof (decodedToken.role) === 'object' && decodedToken.role.indexOf(role) >= 0;
}
