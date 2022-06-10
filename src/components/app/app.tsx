import {
    component$,
    createContext,
    useClientEffect$,
    useContextProvider,
    useDocument,
    useServerMount$,
    useStore,
    useStyles$,
} from '@builder.io/qwik';

import styles from '../../index.scss';
import { createFocusTrap, FocusTrap } from 'focus-trap';
import { CommentList } from '../comment-list/CommentList';
import nodeFetch from 'node-fetch';
import {
    CommentData,
    CommentPayload,
    CurrentUserData,
} from '../../models/models';

interface CommentsService {
    addComment: (payload: CommentPayload) => Promise<void>;
    addChildComment: (payload: CommentPayload, id: string) => Promise<void>;
    updateComment: (id: string, payload: CommentPayload) => Promise<void>;
    deleteComment: (id: string) => Promise<void>;
    addRating: (rating: number, id: string) => Promise<void>;
    editRating: (rating: number, id: string) => Promise<void>;
}

interface AppContext {
    sessionId?: string;
}

type FocusTrapProvider = { trap?: FocusTrap };
type CommentListProvider = {
    comments: CommentData[];
    commentsService?: CommentsService;
    user?: CurrentUserData;
};

const port = process.env.PORT || 3000;

export const HOST = `http://localhost:${port}`;

export const COMMENTS_SERVICE =
    createContext<CommentListProvider>('CommentList');
export const FOCUS_TRAP = createContext<FocusTrapProvider>('FocusTrap');

export const App = component$<AppContext>(
    (props) => {
        useStyles$(styles);
        const focusTrap: FocusTrapProvider = useStore({
            trap: undefined,
        });

        const state: CommentListProvider = useStore({
            comments: [],
            commentsService: undefined,
            user: undefined,
        });

        useContextProvider(FOCUS_TRAP, focusTrap);
        useContextProvider(COMMENTS_SERVICE, state);

        useServerMount$(async () => {
            const headers = props.sessionId
                ? { Cookie: `sessionId=${props.sessionId}` }
                : undefined;
            const [comments, user] = await Promise.all([
                nodeFetch(`${HOST}/api/comments`, {
                    method: 'GET',
                    headers,
                }).then((r) => r.json()),
                nodeFetch(`${HOST}/api/me`, {
                    method: 'GET',
                    headers,
                }).then((r) => r.json()),
            ]);

            state.comments = comments.comments;
            state.user = user;
        });

        useClientEffect$(() => {
            initializeFocusTrap(focusTrap);
            initializeCommentsService(state);
        });

        return <CommentList comments={state.comments}></CommentList>;
    },
    { tagName: 'main' }
);

export const initializeFocusTrap = (state: FocusTrapProvider) => {
    const document = useDocument();
    const trap = createFocusTrap('', { document });
    state.trap = trap;
};

export const initializeCommentsService = (state: CommentListProvider) => {
    const service = {
        async addComment(payload: CommentPayload) {
            await fetch(`${HOST}/api/comments`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            await updateCommentList(state);
        },

        async addChildComment(payload: CommentPayload, id: string) {
            await fetch(`${HOST}/api/comments/${id}`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            await updateCommentList(state);
        },

        async updateComment(id: string, payload: CommentPayload) {
            await fetch(`${HOST}/api/comments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            await updateCommentList(state);
        },

        async deleteComment(id: string) {
            await fetch(`${HOST}/api/comments/${id}`, {
                method: 'DELETE',
            });
            await updateCommentList(state);
        },

        async addRating(rating: number, id: string) {
            await fetch(`${HOST}/api/ratings`, {
                method: 'POST',
                body: JSON.stringify({ rating, commentId: id }),
            });
            await updateCommentList(state);
            await updateUserRatings(state);
        },

        async editRating(rating: number, id: string) {
            await fetch(`${HOST}/api/ratings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ rating }),
            });
            await updateCommentList(state);
            await updateUserRatings(state);
        },
    };
    state.commentsService = service;
};

export const updateCommentList = async (state: CommentListProvider) => {
    const comments = await fetch(`${HOST}/api/comments`, {
        method: 'GET',
    });
    const res = await comments.json();
    state.comments = res.comments;
};

export const updateUserRatings = async (state: CommentListProvider) => {
    const response = await fetch(`${HOST}/api/me`, {
        method: 'GET',
    });
    state.user = await response.json();
};
