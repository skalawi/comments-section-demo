import {
    getPlatform,
    implicit$FirstArg,
    QRL,
    useDocument,
    useSequentialScope,
    useWaitOn,
    ValueOrPromise,
} from '@builder.io/qwik';

export type RunnableQrl = QRL<(event: unknown, element: Element) => void>;

export type ClassList = {
    [className: string]: boolean;
};

export interface BaseProps {
    classList: ClassList | string;
}

export const classList = (
    _: TemplateStringsArray,
    props: BaseProps,
    classes: ClassList | string
): ClassList => {
    const original = toClassObject(props.classList);
    const incoming = toClassObject(classes);
    return { ...original, ...incoming };
};

export const noop = () => {};

const toClassObject = (classes: ClassList | string): ClassList => {
    if (typeof classes === 'string') {
        return { [classes]: true };
    }
    return classes;
};

export function useClientMountOnlyQrl(
    qrl: QRL<() => ValueOrPromise<void | (() => void)>>
): void {
    const [watch, setWatch] = useSequentialScope();
    if (!watch) {
        setWatch(true);
        const isClient = !getPlatform(useDocument()).isServer;
        if (isClient) {
            useWaitOn(qrl.invoke());
        }
    }
}

export const useClientMountOnly$ = implicit$FirstArg(useClientMountOnlyQrl);
