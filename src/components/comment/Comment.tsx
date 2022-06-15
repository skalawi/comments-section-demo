import {
    component$,
    mutable,
    useContext,
    useRef,
    useStore,
} from '@builder.io/qwik';
import {
    ChildComment,
    CurrentUserData,
    UserRatingData,
} from '../../models/models';
import { RunnableQrl } from '../../shared/utils';
import { COMMENTS_SERVICE } from '../app/app';
import { Rating } from '../rating/Rating';
import { Ripple } from '../ripple/Ripple';

export interface CommentProps extends ChildComment {
    onReplyQrl?: RunnableQrl;
    onDeleteQrl?: RunnableQrl;
}

export const getRating = (
    id: string,
    user: CurrentUserData
): UserRatingData | null => {
    const rating = user.ratings.find((r) => r.commentId === id);
    if (!rating) {
        return null;
    }
    return rating;
};

export const Comment = component$<CommentProps>(
    (props) => {
        const { commentsService, user } = useContext(COMMENTS_SERVICE);
        const state = useStore({
            inEditMode: false,
        });
        const textarea = useRef<HTMLTextAreaElement>();
        const rtf = new Intl.RelativeTimeFormat('en', {
            localeMatcher: 'best fit',
            numeric: 'always',
            style: 'long',
        });
        const isMyComment = props.user.userId === user?.userId;
        return (
            <>
                <Rating
                    classList={'comment__rating'}
                    rating={mutable(props.rating)}
                    currentRating={mutable(
                        getRating(props.commentId, user!)?.rating || 0
                    )}
                    onRating$={(rating: number) => {
                        const current = getRating(props.commentId, user!);
                        if (!current) {
                            commentsService?.addRating(rating, props.commentId);
                        } else {
                            commentsService?.editRating(
                                rating,
                                current.ratingId
                            );
                        }
                    }}
                ></Rating>
                <div class='comment__title title'>
                    <img
                        src={props.user.image}
                        class='title__image'
                        alt={`${props.user.name} avatar`}
                        loading='lazy'
                    ></img>
                    <a class='title__name'>{props.user.name}</a>
                    {isMyComment && <span class='title__label'>you</span>}
                    <time dateTime={props.date} class='title__date'>
                        {getRelativeTime(rtf, props.date)}
                    </time>
                </div>
                {state.inEditMode ? (
                    <textarea
                        custom-textarea
                        ref={textarea}
                        name='message'
                        class='comment__control'
                        minLength={1}
                        rows={3}
                        value={props.message}
                    ></textarea>
                ) : (
                    <p class='comment__message'>{props.message}</p>
                )}

                <div class='comment__actions'>
                    {isMyComment ? (
                        <>
                            <button
                                onClickQrl={props.onDeleteQrl}
                                icon-button
                                class='custom-button--danger'
                            >
                                <i class='icon-icon-delete'></i>Delete
                                <Ripple></Ripple>
                            </button>
                            <button
                                onClick$={() => (state.inEditMode = true)}
                                icon-button
                                class='custom-button--primary'
                            >
                                <i class='icon-icon-edit'></i>Edit
                                <Ripple></Ripple>
                            </button>
                        </>
                    ) : (
                        <button
                            icon-button
                            onClickQrl={props.onReplyQrl}
                            class='custom-button--primary'
                        >
                            <i class='icon-icon-reply'></i>Reply
                            <Ripple></Ripple>
                        </button>
                    )}
                </div>
                {state.inEditMode && (
                    <button
                        class='comment__submit-button custom-button--primary'
                        custom-button
                        onClick$={() => {
                            const { current } = textarea;
                            if (current) {
                                commentsService
                                    ?.updateComment(props.commentId, {
                                        message: current.value,
                                    })
                                    .then(() => {
                                        state.inEditMode = false;
                                    });
                            }
                        }}
                    >
                        UPDATE
                    </button>
                )}
            </>
        );
    },
    { tagName: 'article' }
);

export const getRelativeTime = (
    rtf: Intl.RelativeTimeFormat,
    date: string
): string => {
    const now = new Date();
    const then = new Date(date);
    const difference = now.getTime() - then.getTime();

    const years = now.getFullYear() - then.getFullYear();
    if (years) {
        return rtf.format(-years, 'year');
    }
    const months = Math.abs(now.getMonth() - then.getMonth());
    if (months) {
        return rtf.format(-months, 'month');
    }
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    if (days) {
        return days > 7
            ? rtf.format(-(days / 7), 'week')
            : rtf.format(-days, 'day');
    }
    const hours = Math.floor(difference / (1000 * 60 * 60));
    if (hours) {
        return rtf.format(-hours, 'hour');
    }
    const minutes = Math.floor(difference / (1000 * 60));
    if (minutes) {
        return rtf.format(-minutes, 'month');
    }
    const seconds = Math.floor(difference / 1000);
    if (seconds) {
        return rtf.format(-seconds, 'second');
    }
    return 'just now';
};
