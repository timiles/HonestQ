import * as $ from 'jquery';

export function onCtrlEnter(selector: string, callback: (e: JQuery.Event<HTMLElement, null>) => void): void {
    $(selector).keydown((e) => {
        if ((e.ctrlKey || e.metaKey) && (e.keyCode === 13 || e.keyCode === 10)) {
            e.stopPropagation();
            callback(e);
        }
    });
}

export function enableConfirmOnLeave(shouldConfirm: boolean): void {
    window.onbeforeunload = shouldConfirm ? () => true : null;
}
