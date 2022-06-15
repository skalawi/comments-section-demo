import {
    component$,
    QRL,
    useContext,
    useRef,
    useWatch$,
} from '@builder.io/qwik';
import { UserData } from '../../models/models';
import { COMMENTS_SERVICE } from '../app/app';
import { Form } from '../form/Form';
import { Ripple } from '../ripple/Ripple';

export interface CommentFormProps {
    autofocus?: boolean;
    parentId?: string;
    user?: UserData;
    onAfterSubmitQrl?: QRL<() => void>;
}

export const CommentForm = component$(
    (props: CommentFormProps) => {
        const context = useContext(COMMENTS_SERVICE);
        const textarea = useRef<HTMLTextAreaElement>();
        useWatch$((track) => {
            const el = track(textarea, 'current');
            if (el && props.autofocus) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                el.focus({ preventScroll: true });
            }
        });

        return (
            <Form
                class='comment-form'
                prevent={true}
                onSubmit$={() => {
                    const { current: input } = textarea;
                    if (input?.value) {
                        if (props.parentId) {
                            context.commentsService
                                ?.addChildComment(
                                    { message: input.value },
                                    props.parentId
                                )
                                .then(() => {
                                    input.value = '';
                                    props.onAfterSubmitQrl?.invoke();
                                });
                        } else {
                            context.commentsService
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
                    src={context.user?.image}
                    class='comment-form__image'
                    alt={`${context.user?.name} avatar`}
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
                    <Ripple></Ripple>
                </button>
            </Form>
        );
    },
    { tagName: 'section' }
);
