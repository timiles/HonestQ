import * as React from 'react';

export default class ThrowError extends React.Component {

    public UNSAFE_componentWillMount() {
        // This runs server side
        throw new Error('Error');
    }
}
