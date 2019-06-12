import React from 'react';

interface PageLinkProps {
    disabled: boolean;
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

// Question: what's better, this or `const PageLink = class extends ...`?
// tslint:disable:max-classes-per-file
class PageLink extends React.Component<PageLinkProps, {}> {
    public render() {
        const { disabled, onClick, children } = this.props;
        return (
            <li className={`page-item ${disabled ? 'disabled' : ''}`}>
                <a
                    className="page-link"
                    href="#"
                    tabIndex={disabled ? -1 : undefined}
                    onClick={onClick}
                >
                    {children}
                </a>
            </li>
        );
    }
}

interface Props {
    pageNumber: number;
    more: boolean;
    onPageChange: (nextPageNumber: number) => void;
}

export default class PaginationControl extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handlePrevious = this.handlePrevious.bind(this);
        this.handleNext = this.handleNext.bind(this);
    }

    public render() {
        const { pageNumber, more } = this.props;
        const previous = pageNumber > 1;

        if (!previous && !more) {
            return null;
        }

        return (
            <nav aria-label="Question search pagination">
                <ul className="pagination pagination-sm justify-content-end mb-1">
                    <PageLink disabled={!previous} onClick={this.handlePrevious}>
                        Previous
                    </PageLink>
                    <PageLink disabled={!more} onClick={this.handleNext}>
                        Next
                    </PageLink>
                </ul>
            </nav>
        );
    }

    private handlePrevious(event: React.MouseEvent<HTMLAnchorElement>): void {
        event.preventDefault();
        this.props.onPageChange(this.props.pageNumber - 1);
    }

    private handleNext(event: React.MouseEvent<HTMLAnchorElement>): void {
        event.preventDefault();
        this.props.onPageChange(this.props.pageNumber + 1);
    }
}
