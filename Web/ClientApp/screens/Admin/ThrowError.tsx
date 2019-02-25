import * as React from 'react';

export default class ThrowError extends React.Component {

    constructor(props: {}) {
        super(props);

        throw new Error('Error');
    }
}
