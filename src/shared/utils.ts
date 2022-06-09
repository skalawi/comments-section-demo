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
