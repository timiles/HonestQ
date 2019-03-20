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

export function getValidationClassName(submitted?: boolean, value?: any): string {
    return submitted ? value ? 'is-valid' : 'is-invalid' : '';
}

export function getBackgroundColor(isDarkMode = false) {
    return isDarkMode ? '#28374B' : '#EDF6FB';
}

export function setDarkMode(isDarkMode = true) {
    if (isDarkMode) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    // Update mobile browser theme
    const headerColor = getBackgroundColor(isDarkMode);
    Array.from(document.head.childNodes).forEach((x: ChildNode) => {
        const meta = x as HTMLMetaElement;
        switch (meta.name) {
            case 'msapplication-navbutton-color':
            case 'theme': {
                meta.content = headerColor;
                break;
            }
        }
    });
}
