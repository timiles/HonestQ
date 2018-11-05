import * as React from 'react';

export default class Intro extends React.Component {
    public render() {
        return (
            <>
                <p>
                    HonestQ is a Q&amp;A / debate site for questions which may not have a simple answer.
                </p>
                <p>
                    This might be because the question is philosophical or subjective in nature;
                    maybe there are many possible answers; maybe more research is needed;
                    or perhaps the answers are hotly contested &ndash; they can't all be right... right?
                </p>
                <p>
                    HonestQ strongly encourages linking to sources, and using science, statistics,
                    and an understanding of the human condition to challenge received wisdom.
                </p>
                <p>
                    We believe it can be healthy to embrace conflict, to step outside of your comfort zone,
                    and to listen to diverse opinions outside of your echo chamber &ndash;
                    even if it's just so that you can argue against them more effectively.
                    Or who knows, you may even end up with a new point of view yourself.
                </p>
                <p>
                    Happy debating! <img src="/favicon-32x32.png" />
                </p>
            </>
        );
    }
}
