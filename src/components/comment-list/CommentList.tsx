import { useStore, component$, Host } from '@builder.io/qwik';
import { Dialog } from '../dialog/Dialog';
import { Ripple } from '../ripple/Ripple';
import { Comment } from '../comment/Comment';

import { deleteComment, onDeleteCancel, onDeleteComment } from './utils';
import { CommentData, UserData } from '../../models/models';
import { CommentForm } from '../comment-form/comment-form';

export interface CommentListProps {
    comments: CommentData[];
}

export interface ListState {
    deleteDialogOpened: boolean;
    deleteId?: string;
    activeComments: Record<string, UserData>;
}

export const CommentList = component$(
    (props: CommentListProps) => {
        const state: ListState = useStore({
            deleteDialogOpened: false,
            deleteId: undefined,
            activeComments: {},
        });
        return (
            <Host class='main-container'>
                {props.comments.map((comment) => {
                    const { children, ...parentComment } = comment;
                    const parentId = parentComment.commentId;
                    return (
                        <>
                            <Comment
                                class='comment'
                                {...parentComment}
                                onReply$={() => {
                                    state.activeComments[parentId] =
                                        parentComment.user;
                                }}
                            ></Comment>
                            <section class='subcomments'>
                                {children.map((childComment) => (
                                    <Comment
                                        class='comment'
                                        {...childComment}
                                        onReply$={() => {
                                            state.activeComments[parentId] =
                                                childComment.user;
                                        }}
                                    ></Comment>
                                ))}
                                {state.activeComments[parentId] && (
                                    <CommentForm
                                        parentId={parentId}
                                        user={state.activeComments[parentId]}
                                        onAfterSubmit$={() => {
                                            delete state.activeComments[
                                                parentId
                                            ];
                                        }}
                                    ></CommentForm>
                                )}
                            </section>
                        </>
                    );
                })}
                <CommentForm></CommentForm>
                <Dialog
                    class='delete-dialog'
                    opened={state.deleteDialogOpened}
                    onDialogclose$={() => onDeleteCancel(state)}
                >
                    <h1 q:slot='header'>Delete comment</h1>
                    <p>
                        Are you sure you want to delete this comment? This will
                        remove the comment and can't be undone
                    </p>
                    <button
                        q:slot='footer'
                        custom-button
                        class='custom-button--secondary'
                        onClick$={() => onDeleteCancel(state)}
                    >
                        NO, CANCEL
                        <Ripple />
                    </button>
                    <button
                        q:slot='footer'
                        custom-button
                        class='custom-button--danger'
                        onClick$={() => deleteComment(state, props)}
                    >
                        YES, DELETE
                        <Ripple />
                    </button>
                </Dialog>
            </Host>
        );
    },
    { tagName: 'div' }
);
