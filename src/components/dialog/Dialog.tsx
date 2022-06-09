import {
    useStore,
    Slot,
    component$,
    QRL,
    useContext,
    useRef,
    useWatch$,
} from '@builder.io/qwik';
import { FocusTrap } from 'focus-trap';
import { FOCUS_TRAP } from '../app/app';

export interface DialogProps {
    opened: boolean;
    onDialogcloseQrl?: QRL<() => void>;
    trap?: FocusTrap;
}

interface DialogState {
    closing: boolean;
    trap?: FocusTrap;
}

interface DialogElement extends HTMLElement {
    open: boolean;
    showModal: () => void;
    close: () => void;
}

export const Dialog = component$(
    (props: DialogProps) => {
        const state = useStore<DialogState>({
            closing: false,
            trap: undefined,
        });
        const dialogRef = useRef<DialogElement>();
        const focusTrap = useContext(FOCUS_TRAP);

        useWatch$(
            (track) => {
                const trap = track(focusTrap, 'trap');
                if (trap) {
                    state.trap = trap;
                }
            },
            { run: 'visible' }
        );

        useWatch$(
            (track) => {
                const opened = track(props, 'opened');
                const dialog = dialogRef.current;
                if (!dialog) {
                    return;
                }
                if (opened && !dialog.open) {
                    dialog.showModal();
                    console.log(state.trap);
                    state.trap?.updateContainerElements(dialog);
                    state.trap?.activate();
                } else if (!opened && dialog.open && !state.closing) {
                    state.closing = true;
                    state.trap?.deactivate();
                }
            },
            { run: 'visible' }
        );

        return (
            <dialog
                ref={dialogRef}
                class={{
                    dialog: true,
                    'dialog--closing': state.closing,
                }}
                onClick$={({ clientX, clientY }) => {
                    const rect = dialogRef.current!.getBoundingClientRect();

                    if (
                        clientY < rect.top ||
                        clientY > rect.bottom ||
                        clientX < rect.left ||
                        clientX > rect.right
                    ) {
                        props.onDialogcloseQrl?.invoke();
                    }
                }}
                onAnimationend$={() => {
                    if (state.closing) {
                        state.closing = false;
                        dialogRef.current?.close();
                    }
                }}
            >
                <header>
                    <Slot name='header' />
                </header>
                <Slot />
                <footer>
                    <Slot name='footer' />
                </footer>
            </dialog>
        );
    },
    { tagName: 'modal' }
);
