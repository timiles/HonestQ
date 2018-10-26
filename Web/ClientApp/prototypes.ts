// support for JQuery tooltip plugin from Bootstrap 4
interface JQuery {
    tooltip(): any;
}

interface String {
    toSentenceCase(): string;
}

String.prototype.toSentenceCase = function () {
    return this.replace(/([A-Z])/g, ' $1');
};
