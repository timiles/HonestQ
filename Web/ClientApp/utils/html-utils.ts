import * as $ from 'jquery';

export function focusFirstTextInput(formSelector: string) {
    $($('input[type=text],textarea', $(formSelector))[0]).focus();
}

export function onCtrlEnter(selector: string, callback: (e: JQuery.Event<HTMLElement, null>) => void): void {
    $(selector).keydown((e) => {
        if ((e.ctrlKey || e.metaKey) && (e.keyCode === 13 || e.keyCode === 10)) {
            e.stopPropagation();
            callback(e);
        }
    });
}

export function generateRandomHtmlId(prefix?: string): string {
    return `${prefix || 'id'}_${Math.random().toString(36).substring(2)}`;
}
