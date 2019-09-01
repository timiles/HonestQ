// support for JQuery tooltip plugin from Bootstrap 4
interface JQuery {
  popover(): any;
  tooltip(): any;
}

interface String {
  toSentenceCase(capitaliseFirstLetter?: boolean): string;
}

String.prototype.toSentenceCase = function (capitaliseFirstLetter?: boolean) {
  const sentenceCase = this.replace(/([A-Z])/g, ' $1');
  if (capitaliseFirstLetter) {
    return sentenceCase[0].toUpperCase() + sentenceCase.substring(1);
  }
  return sentenceCase;
};
