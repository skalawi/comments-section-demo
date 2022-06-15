import {
    component$,
    Host,
    QRL,
    Slot,
    useCleanup$,
    useClientEffect$,
    useRef,
    useStore,
} from '@builder.io/qwik';

export interface FormProps {
    onSubmitQrl?: QRL<(event: SubmitEvent) => void>;
    prevent?: boolean;
}

interface FormState {
    form?: {
        listener: (event: SubmitEvent) => void;
    };
}

export const Form = component$(
    (props: FormProps) => {
        const state: FormState = useStore({
            form: undefined,
        });
        const form = useRef<HTMLFormElement>();
        useClientEffect$(() => {
            const formElement = form.current;
            if (formElement) {
                const listener = (event: SubmitEvent) => {
                    if (props.prevent) {
                        event.preventDefault();
                    }
                    props.onSubmitQrl?.invoke(event);
                };
                formElement.addEventListener('submit', listener);
                state.form = { listener };
            }
        });
        useCleanup$(() => {
            const { current: formElement } = form;
            if (state.form && formElement) {
                formElement.removeEventListener('submit', state.form.listener);
            }
        });
        return (
            <Host ref={form}>
                <Slot />
            </Host>
        );
    },
    { tagName: 'form' }
);
