import { Host, useHostElement, useStore, component$ } from '@builder.io/qwik';

interface RippleState {
	drop: boolean;
	dropTransitionEnd: boolean;
	fade: boolean;
	fadeTransitionEnd: boolean;
}

export const Ripple = component$(
	() => {
		const state = useStore<RippleState>({
			drop: false,
			dropTransitionEnd: false,
			fade: false,
			fadeTransitionEnd: false,
		});

		return (
			<Host
				class={{
					'ripple--fade': state.fade,
					'ripple--drop': state.drop,
				}}
				onMousedown$={(event) => rippleMousedown(state, event)}
				onMouseup$={() => rippleMouseup(state)}
				onTransitionend$={() => rippleTransitionEnd(state)}
				onMouseleave$={() => rippleMouseup(state)}
			></Host>
		);
	},
	{ tagName: 'ripple' }
);

const reset = (state: RippleState) => {
	state.drop = false;
	state.fade = false;
	state.dropTransitionEnd = false;
	state.fadeTransitionEnd = false;
};

const positionRipple = (host: HTMLElement, event: MouseEvent) => {
	const { height, width } = host.getBoundingClientRect();

	const size = Number(2 * Math.sqrt(height * height + width * width));

	const { offsetX: x, offsetY: y } = event;

	const xPos = Number(x - size / 2);
	const yPos = Number(y - size / 2);

	host.style.setProperty('--ripple-x', `${xPos}px`);
	host.style.setProperty('--ripple-y', `${yPos}px`);
	host.style.setProperty('--ripple-size', `${size}px`);
};

export const rippleMousedown = (state: RippleState, event: MouseEvent) => {
	reset(state);
	const host = useHostElement() as HTMLElement;

	requestAnimationFrame(() => {
		positionRipple(host, event);
		state.drop = true;
	});
};

export const fade = (state: RippleState) => {
	state.drop = false;
};

export const rippleMouseup = (state: RippleState) => {
	if (state.fadeTransitionEnd || !state.drop) {
		return;
	}
	state.fade = true;
	if (state.dropTransitionEnd) {
		fade(state);
	}
};

export const rippleTransitionEnd = (state: RippleState) => {
	if (!state.dropTransitionEnd) {
		state.dropTransitionEnd = true;

		if (state.fade) {
			fade(state);
		}
	}

	if (state.dropTransitionEnd && state.fade) {
		state.fadeTransitionEnd = true;
		reset(state);
	}
};
