/**
 * System Properties Verification Virtual Lab
 * Input Signal Library and Generator Functions
 */

const Signals = {
    // Definitions of all supported signals
    definitions: {
        sine: {
            id: 'sine',
            name: 'Sine Wave',
            latex: 'x(t) = A \\sin(2\\pi f t)',
            description: 'Periodic sinusoidal wave with amplitude A and frequency f',
            defaultParams: {
                amplitude: 1.0,
                frequency: 1.0,
                phase: 0.0,
                offset: 0.0
            },
            paramControls: [
                { id: 'amplitude', label: 'Amplitude (A)', min: -5, max: 5, step: 0.1, default: 1.0 },
                { id: 'frequency', label: 'Frequency (f, Hz)', min: 0.2, max: 5, step: 0.1, default: 1.0 },
                { id: 'phase', label: 'Phase (rad)', min: -Math.PI, max: Math.PI, step: 0.1, default: 0.0 }
            ],
            fn: (t, p) => p.amplitude * Math.sin(2 * Math.PI * p.frequency * t + (p.phase || 0))
        },

        cosine: {
            id: 'cosine',
            name: 'Cosine Wave',
            latex: 'x(t) = A \\cos(2\\pi f t)',
            description: 'Periodic cosine wave with amplitude A and frequency f',
            defaultParams: {
                amplitude: 1.0,
                frequency: 1.0,
                phase: 0.0,
                offset: 0.0
            },
            paramControls: [
                { id: 'amplitude', label: 'Amplitude (A)', min: -5, max: 5, step: 0.1, default: 1.0 },
                { id: 'frequency', label: 'Frequency (f, Hz)', min: 0.2, max: 5, step: 0.1, default: 1.0 }
            ],
            fn: (t, p) => p.amplitude * Math.cos(2 * Math.PI * p.frequency * t + (p.phase || 0))
        },

        exponential: {
            id: 'exponential',
            name: 'Exponential Signal',
            latex: 'x(t) = A e^{-a t} u(t)',
            description: 'One-sided exponential decaying (a > 0) or growing (a < 0) for t >= 0',
            defaultParams: {
                amplitude: 1.0,
                decay: 0.8
            },
            paramControls: [
                { id: 'amplitude', label: 'Amplitude (A)', min: -3, max: 3, step: 0.1, default: 1.0 },
                { id: 'decay', label: 'Rate parameter (a)', min: -1.5, max: 2.5, step: 0.1, default: 0.8 }
            ],
            fn: (t, p) => {
                if (t < 0) return 0;
                // Bound large values to prevent infinity overflow in visualizer
                const expVal = Math.exp(-p.decay * t);
                return p.amplitude * (isFinite(expVal) ? expVal : (p.decay < 0 ? 50 : 0));
            }
        },

        step: {
            id: 'step',
            name: 'Unit Step u(t)',
            latex: 'x(t) = A \\cdot u(t - t_0)',
            description: 'Heaviside step function: 0 for t < t_0, A for t >= t_0',
            defaultParams: {
                amplitude: 1.0,
                shift: 0.0
            },
            paramControls: [
                { id: 'amplitude', label: 'Amplitude (A)', min: -3, max: 3, step: 0.1, default: 1.0 },
                { id: 'shift', label: 'Step Time (t₀)', min: -3, max: 3, step: 0.5, default: 0.0 }
            ],
            fn: (t, p) => {
                const t0 = p.shift || 0;
                if (t < t0) return 0;
                if (t === t0) return 0.5 * p.amplitude;
                return p.amplitude;
            }
        },

        ramp: {
            id: 'ramp',
            name: 'Ramp Signal r(t)',
            latex: 'x(t) = A (t - t_0) u(t - t_0)',
            description: 'Ramp function increasing linearly for t >= t_0',
            defaultParams: {
                amplitude: 1.0,
                shift: 0.0
            },
            paramControls: [
                { id: 'amplitude', label: 'Slope / Amplitude (A)', min: -3, max: 3, step: 0.1, default: 1.0 },
                { id: 'shift', label: 'Start Time (t₀)', min: -3, max: 3, step: 0.5, default: 0.0 }
            ],
            fn: (t, p) => {
                const t0 = p.shift || 0;
                return t >= t0 ? p.amplitude * (t - t0) : 0;
            }
        },

        pulse: {
            id: 'pulse',
            name: 'Rectangular Pulse',
            latex: 'x(t) = A \\cdot \\text{rect}\\left(\\frac{t - t_0}{T_w}\\right)',
            description: 'Finite pulse of width Tw centered at t_0',
            defaultParams: {
                amplitude: 1.0,
                width: 2.0,
                shift: 0.0
            },
            paramControls: [
                { id: 'amplitude', label: 'Amplitude (A)', min: -3, max: 3, step: 0.1, default: 1.0 },
                { id: 'width', label: 'Pulse Width (T_w)', min: 0.5, max: 4, step: 0.5, default: 2.0 },
                { id: 'shift', label: 'Center (t₀)', min: -3, max: 3, step: 0.5, default: 0.0 }
            ],
            fn: (t, p) => {
                const t0 = p.shift || 0;
                const halfW = (p.width || 2.0) / 2;
                return Math.abs(t - t0) <= halfW ? p.amplitude : 0;
            }
        }
    },

    /**
     * Get signal definition by ID
     */
    get(signalId) {
        return this.definitions[signalId] || this.definitions.sine;
    },

    /**
     * Evaluate single value at time t
     */
    evaluate(signalId, params, t) {
        const sig = this.get(signalId);
        const mergedParams = { ...sig.defaultParams, ...params };
        return sig.fn(t, mergedParams);
    },

    /**
     * Evaluate array of values for time grid tArray
     */
    evaluateArray(signalId, params, tArray) {
        const sig = this.get(signalId);
        const mergedParams = { ...sig.defaultParams, ...params };
        return tArray.map(t => sig.fn(t, mergedParams));
    },

    /**
     * Create a bound callable function f(t) for a given signal configuration
     */
    createFunction(signalId, params) {
        const sig = this.get(signalId);
        const mergedParams = { ...sig.defaultParams, ...params };
        return (t) => sig.fn(t, mergedParams);
    }
};

window.Signals = Signals;
