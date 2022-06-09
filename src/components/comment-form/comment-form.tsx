import {
    $,
    component$,
    QRL,
    useContext,
    useRef,
    useStore,
} from '@builder.io/qwik';
import { UserData } from '../../models/models';
import { COMMENTS_SERVICE } from '../app/app';
import { Form } from '../form/Form';

export interface CommentFormProps {
    parentId?: string;
    user?: UserData;
    onAfterSubmitQrl?: QRL<() => void>;
}

export const CommentForm = component$(
    (props: CommentFormProps) => {
        const { user, commentsService } = useContext(COMMENTS_SERVICE);
        const textarea = useRef<HTMLTextAreaElement>();

        return (
            <Form
                class='comment-form'
                prevent={true}
                onSubmit$={() => {
                    const { current: input } = textarea;
                    if (input?.value) {
                        if (props.parentId) {
                            commentsService
                                ?.addChildComment(
                                    { message: input.value },
                                    props.parentId
                                )
                                .then(() => {
                                    input.value = '';
                                    props.onAfterSubmitQrl?.invoke();
                                });
                        } else {
                            commentsService
                                ?.addComment({ message: input.value })
                                .then(() => {
                                    input.value = '';
                                    props.onAfterSubmitQrl?.invoke();
                                });
                        }
                    }
                }}
            >
                <img
                    src={user?.image}
                    class='comment-form__image'
                    alt={`${user?.name} avatar`}
                    loading='lazy'
                ></img>
                <textarea
                    custom-textarea
                    ref={textarea}
                    name='message'
                    class='comment-form__control'
                    minLength={1}
                    rows={3}
                    value=''
                    placeholder='Add a comment...'
                ></textarea>
                <button
                    class='comment-form__submit-button custom-button--primary'
                    custom-button
                >
                    {props.parentId ? 'REPLY' : 'SEND'}
                </button>
            </Form>
        );
    },
    { tagName: 'section' }
);
