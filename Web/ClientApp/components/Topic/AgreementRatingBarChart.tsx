import * as React from 'react';

export default class AgreementRatingScale extends React.Component<{ [key: string]: number }, {}> {

    private readonly agreementRatingValues = ['StronglyDisagree', 'Disagree', 'Neutral', 'Agree', 'StronglyAgree'];
    private readonly agreementRatingColors = ['red', 'orange', 'gold', 'yellowgreen', 'seagreen'];

    constructor(props: { [key: string]: number }) {
        super(props);
    }

    public render() {

        const maxAgreementRating = Math.max(...this.agreementRatingValues.map((v) => (this.props[v] || 0)));
        if (maxAgreementRating === 0) {
            // No ratings yet.
            return null;
        }

        const chartWidth = 50;
        const barWidth = chartWidth / 5;
        const chartHeight = 20;

        const bars = this.agreementRatingValues.map((v, i) => ({
            x: i * barWidth,
            color: this.agreementRatingColors[i],
            height: Math.max(1, chartHeight * (this.props[v] || 0) / maxAgreementRating),
        }));

        return (
            <svg width={chartWidth} height={chartHeight}>
                {bars.map((bar, i) =>
                    <rect
                        key={`rect_${i}`}
                        fill={bar.color}
                        x={bar.x}
                        width={barWidth}
                        y={chartHeight - bar.height}
                        height={bar.height}
                    />)}
            </svg>
        );
    }
}
