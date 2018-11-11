import * as React from 'react';
import { LoggedInUserModel } from './server-models';

export const LoggedInUserContext = React.createContext<LoggedInUserModel | undefined>(undefined);
