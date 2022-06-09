import type { ListState, CommentListProps } from './CommentList';

export const onDeleteComment = (state: ListState, id: string) => {
    state.deleteId = id;
    state.deleteDialogOpened = true;
};

export const onDeleteCancel = (state: ListState) => {
    state.deleteId = undefined;
    state.deleteDialogOpened = false;
};

export const deleteComment = (state: ListState, props: CommentListProps) => {
    if (state.deleteId) {
        const i = props.comments.findIndex(
            (comment) => comment.commentId === state.deleteId
        );
        props.comments.splice(i, 1);
        state.deleteId = undefined;
        state.deleteDialogOpened = false;
    }
};
