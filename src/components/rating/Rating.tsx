import { component$, Host, QRL, useStore } from '@builder.io/qwik';
import { BaseProps, classList } from '../../shared/utils';
import { Ripple } from '../ripple/Ripple';

export interface RatingProps extends BaseProps {
    rating: number;
    currentRating: number;
    onRatingQrl?: QRL<(rating: number) => void>;
}

interface RatingState {
    value: number;
}

export const Rating = component$(
    (props: RatingProps) => {
        const state: RatingState = useStore({
            value: props.currentRating,
        });

        return (
            <Host
                class={classList`${props}${'rating'}`}
                tabIndex={0}
                onKeydown$={(event) => keyboardRate(state, props, event)}
            >
                <button
                    tabIndex={-1}
                    class={{
                        rating__button: true,
                        'rating__button--checked': state.value === 1,
                    }}
                    onClick$={() => rate(state, props, 1)}
                >
                    +<Ripple />
                </button>
                <span class='rating__label'>{props.rating}</span>
                <button
                    tabIndex={-1}
                    class={{
                        rating__button: true,
                        'rating__button--checked': state.value === -1,
                    }}
                    onClick$={() => rate(state, props, -1)}
                >
                    -
                    <Ripple />
                </button>
            </Host>
        );
    },
    { tagName: 'rating' }
);

export const rate = async (
    state: RatingState,
    props: RatingProps,
    value: number
) => {
    const { currentRating } = props;
    let newValue: number;
    if (state.value !== value) {
        newValue = value;
    } else {
        newValue = 0;
    }
    if (newValue !== currentRating) {
        state.value = newValue;
        props.onRatingQrl?.invoke(newValue);
    }
};

export const keyboardRate = (
    state: RatingState,
    props: RatingProps,
    event: KeyboardEvent
) => {
    const { key } = event;
    if (key === 'ArrowUp' && state.value !== 1) {
        rate(state, props, state.value + 1);
    } else if (key === 'ArrowDown' && state.value !== -1) {
        rate(state, props, state.value - 1);
    }
};
