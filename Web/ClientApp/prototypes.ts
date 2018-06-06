interface String {
    toSentenceCase(): string;
}

String.prototype.toSentenceCase = function () {
    return this.replace(/([A-Z])/g, ' $1');
};
