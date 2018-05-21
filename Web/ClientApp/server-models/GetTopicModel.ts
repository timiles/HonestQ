// tslint:disable:interface-name

export interface GetTopicModel {
    name: string;
    statements: StatementModel[];
}

interface StatementModel {
    text: string;
}
