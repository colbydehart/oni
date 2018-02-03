/**
 * BookmarksPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { SidebarPane } from "./../Sidebar"
import { IBookmark, IBookmarksProvider } from "./index"

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

export class BookmarksPane implements SidebarPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    constructor(private _bookmarksProvider: IBookmarksProvider) {}

    public get id(): string {
        return "oni.sidebar.bookmarks"
    }

    public get title(): string {
        return "Marks"
    }

    public enter(): void {
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    public render(): JSX.Element {
        return (
            <BookmarksPaneView
                bookmarksProvider={this._bookmarksProvider}
                onEnter={this._onEnter}
                onLeave={this._onLeave}
            />
        )
    }
}

export interface IBookmarksPaneViewProps {
    bookmarksProvider: IBookmarksProvider
    onEnter: IEvent<void>
    onLeave: IEvent<void>
}

export interface IBookmarksPaneViewState {
    bookmarks: IBookmark[]
    isActive: boolean
}

export class BookmarksPaneView extends React.PureComponent<
    IBookmarksPaneViewProps,
    IBookmarksPaneViewState
> {
    private _subscriptions: IDisposable[] = []

    constructor(props: IBookmarksPaneViewProps) {
        super(props)
        this.state = {
            bookmarks: this.props.bookmarksProvider.bookmarks,
            isActive: false,
        }
    }

    public componentDidMount(): void {
        this._clearExistingSubscriptions()

        const s1 = this.props.bookmarksProvider.onBookmarksUpdated.subscribe(() => {
            this.setState({
                bookmarks: this.props.bookmarksProvider.bookmarks,
            })
        })

        const s2 = this.props.onEnter.subscribe(() => this.setState({ isActive: true }))
        const s3 = this.props.onLeave.subscribe(() => this.setState({ isActive: false }))

        this._subscriptions = [s1, s2, s3]
    }

    public componentWillUnmount(): void {
        this._clearExistingSubscriptions()
    }

    public render(): JSX.Element {
        if (this.state.bookmarks.length === 0) {
            return (
                <SidebarEmptyPaneView
                    active={this.state.isActive}
                    contentsText="No bookmarks, yet!"
                />
            )
        } else {
            const globalMarks = this.state.bookmarks.filter(bm => bm.group === "Global Marks")
            const localMarks = this.state.bookmarks.filter(bm => bm.group === "Local Marks")

            const globalMarkIds = globalMarks.map(bm => bm.id)
            const localMarkIds = localMarks.map(bm => bm.id)

            const mapToItems = (selectedId: string) => (bm: IBookmark) => (
                <SidebarItemView
                    text={bm.text}
                    isFocused={selectedId === bm.id}
                    isContainer={false}
                    indentationLevel={0}
                />
            )

            const allIds = [...globalMarkIds, ...localMarkIds]

            return (
                <VimNavigator
                    ids={allIds}
                    active={this.state.isActive}
                    render={selectedId => {
                        const mapFunc = mapToItems(selectedId)
                        return (
                            <div>
                                <div>Global</div>
                                {globalMarks.map(mapFunc)}
                                <div>Local</div>
                                {localMarks.map(mapFunc)}
                            </div>
                        )
                    }}
                />
            )
        }
    }

    private _clearExistingSubscriptions(): void {
        this._subscriptions.forEach(sub => sub.dispose())
        this._subscriptions = []
    }
}
