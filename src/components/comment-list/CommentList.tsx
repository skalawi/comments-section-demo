import {
    useStore,
    component$,
    Host,
    useWatch$,
    useContext,
    useRef,
    Ref,
} from '@builder.io/qwik';
import { Dialog } from '../dialog/Dialog';
import { Ripple } from '../ripple/Ripple';
import { Comment } from '../comment/Comment';
import { CommentData, UserData } from '../../models/models';
import { CommentForm } from '../comment-form/comment-form';
import { COMMENTS_SERVICE } from '../app/app';

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
        const { commentsService } = useContext(COMMENTS_SERVICE);
        const state: ListState = useStore({
            deleteDialogOpened: false,
            activeComments: {},
        });
        const dialogContext = useRef<string>();
        useWatch$((track) => {
            const id = track(dialogContext, 'current');
            if (id) {
                state.deleteDialogOpened = true;
            } else {
                state.deleteDialogOpened = false;
            }
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
                                onDelete$={() => {
                                    dialogContext.current = comment.commentId;
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
                                        onDelete$={() => {
                                            dialogContext.current =
                                                childComment.commentId;
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
                    onDialogclose$={() => onDeleteCancel(dialogContext)}
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
                        onClick$={() => onDeleteCancel(dialogContext)}
                    >
                        NO, CANCEL
                        <Ripple />
                    </button>
                    <button
                        q:slot='footer'
                        custom-button
                        class='custom-button--danger'
                        onClick$={() => {
                            commentsService?.deleteComment(
                                dialogContext.current!
                            );
                            dialogContext.current = undefined;
                        }}
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

export const onDeleteCancel = (context: Ref<string>) => {
    context.current = undefined;
};
