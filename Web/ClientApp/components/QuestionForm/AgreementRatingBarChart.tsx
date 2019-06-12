import React from 'react';

export default class AgreementRatingBarChart extends React.Component<{ [key: string]: number }, {}> {

    private readonly agreementRatingValues = ['Disagree', 'Agree'];
    private readonly agreementRatingColors = ['red', 'gold', 'seagreen'];

    constructor(props: { [key: string]: number }) {
        super(props);
    }

    public render() {

        const maxAgreementRating = Math.max(...this.agreementRatingValues.map((v) => (this.props[v] || 0)));
        if (maxAgreementRating === 0) {
            // No ratings yet.
            return null;
        }

        const barWidth = 10;
        const chartWidth = this.agreementRatingValues.length * barWidth;
        const chartHeight = 20;

        const bars = this.agreementRatingValues.map((v, i) => ({
            x: i * barWidth,
            color: this.agreementRatingColors[i],
            height: Math.max(1, chartHeight * (this.props[v] || 0) / maxAgreementRating),
        }));

        return (
            <svg width={chartWidth} height={chartHeight}>
                {bars.map((bar, i: number) =>
                    <rect
                        key={i}
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
