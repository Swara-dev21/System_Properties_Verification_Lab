/**
 * System Properties Verification Virtual Lab
 * System Definitions and Mathematical Operations
 */

const Systems = {
    definitions: {
        scale: {
            id: 'scale',
            number: 1,
            name: 'Linear Scaling',
            latex: 'y(t) = 2x(t)',
            shortFormula: '2x(t)',
            description: 'Scales the input signal amplitude by a constant factor of 2.',
            operation: 'scale',
            parameters: { factor: 2 },
            
            // Evaluates output for a continuous signal function f(t) over a time grid
            evaluateFn: (fn, tArray) => {
                return tArray.map(t => 2 * fn(t));
            },

            // Evaluates output for a discrete array of input samples xValues
            evaluateArray: (xValues, tArray) => {
                return xValues.map(x => 2 * x);
            },

            // Theoretical reference & explanations
            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1(t) + b x_2(t)\\} = 2(a x_1 + b x_2) = a(2 x_1) + b(2 x_2)',
                    proof: 'Homogeneity and additivity both hold. Scaling a sum of signals is identical to scaling each signal separately and summing them.',
                    toleranceExpected: 1e-6
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = 2x(t - t_0) = y(t - t_0)',
                    proof: 'The system operation contains no explicit time dependency. Shifting the input by t₀ delays the output by the exact same amount t₀.',
                    toleranceExpected: 1e-6
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: 0,
                    testConditionLatex: 'y(t) \\text{ depends solely on } x(t)',
                    proof: 'The output at any instant t relies only on the current input value x(t). No future input values (t + Δt) are required.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 2,
                    testConditionLatex: '|x(t)| \\le M_x < \\infty \\implies |y(t)| = 2|x(t)| \\le 2M_x < \\infty',
                    proof: 'Since the gain factor 2 is finite, every bounded input (|x(t)| ≤ Mx) produces an output bounded by My = 2Mx.'
                }
            }
        },

        square: {
            id: 'square',
            number: 2,
            name: 'Squaring System',
            latex: 'y(t) = x^2(t)',
            shortFormula: 'x^2(t)',
            description: 'Computes the instantaneous square of the input signal.',
            operation: 'square',
            parameters: {},

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => {
                    const v = fn(t);
                    return v * v;
                });
            },

            evaluateArray: (xValues) => {
                return xValues.map(x => x * x);
            },

            expectedProperties: {
                linearity: {
                    isLinear: false,
                    verdictText: 'Non-linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = (a x_1 + b x_2)^2 \\ne a x_1^2 + b x_2^2',
                    proof: 'Expanding (a x₁ + b x₂)² yields a² x₁² + 2ab x₁x₂ + b² x₂². The cross term 2ab x₁x₂ violates superposition unless one term is zero. Thus, it fails linearity.',
                    toleranceExpected: 1e-4
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = x^2(t - t_0) = y(t - t_0)',
                    proof: 'The operation does not change over time. Passing a delayed input produces the squared delayed input, matching delayed original output.',
                    toleranceExpected: 1e-6
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: 0,
                    testConditionLatex: 'y(t) \\text{ depends solely on } x(t)',
                    proof: 'The output at time t depends purely on the input at the current time t. It is a memoryless, causal system.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: '|x(t)| \\le M_x < \\infty \\implies |y(t)| = |x(t)|^2 \\le M_x^2 < \\infty',
                    proof: 'If the input magnitude is strictly bounded by Mx, the output is bounded by My = Mx², which is finite.'
                }
            }
        },

        delay: {
            id: 'delay',
            number: 3,
            name: 'Time Delay',
            latex: 'y(t) = x(t - 2)',
            shortFormula: 'x(t - 2)',
            description: 'Delays the input signal by 2 seconds in time.',
            operation: 'delay',
            parameters: { delayAmount: 2 },

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => fn(t - 2));
            },

            evaluateArray: (xValues, tArray) => {
                // Approximate delay on grid using interpolation
                const dt = tArray[1] - tArray[0];
                return tArray.map(t => Utils.interpolate(t - 2, tArray, xValues, 0));
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = a x_1(t - 2) + b x_2(t - 2) = a T\\{x_1\\} + b T\\{x_2\\}',
                    proof: 'Time-delaying a linear combination of signals delays each component identically. Superposition holds exactly.',
                    toleranceExpected: 1e-5
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = x((t - t_0) - 2) = x((t - 2) - t_0) = y(t - t_0)',
                    proof: 'Shifting the input by t₀ and then delaying by 2 gives x(t - 2 - t₀), which equals delaying first and shifting by t₀.',
                    toleranceExpected: 1e-5
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: -2,
                    testConditionLatex: 'y(t) \\text{ requires } x(t - 2) \\text{ (past value since } t - 2 < t\\text{)}',
                    proof: 'The output at time t requires the input from 2 time units in the PAST (t - 2). At t = 0, y(0) = x(-2). Since past values are already known, the system is causal.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 1,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| = |x(t - 2)| \\le M_x < \\infty',
                    proof: 'Time-shifting a signal only changes when values occur, not their peak amplitudes. The bound remains My = Mx.'
                }
            }
        },

        time_scale: {
            id: 'time_scale',
            number: 4,
            name: 'Time-Varying Scaling',
            latex: 'y(t) = t \\cdot x(t)',
            shortFormula: 't \\cdot x(t)',
            description: 'Multiplies the input signal by the independent time variable t.',
            operation: 'time_scale',
            parameters: {},

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => t * fn(t));
            },

            evaluateArray: (xValues, tArray) => {
                return tArray.map((t, idx) => t * xValues[idx]);
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = t(a x_1 + b x_2) = a(t x_1) + b(t x_2)',
                    proof: 'Multiplication by t is distributive over addition: t(a x₁ + b x₂) = a(t x₁) + b(t x₂). Therefore, superposition is satisfied.',
                    toleranceExpected: 1e-6
                },
                timeInvariance: {
                    isTimeInvariant: false,
                    verdictText: 'Time Varying',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = t \\cdot x(t - t_0) \\ne (t - t_0) \\cdot x(t - t_0) = y(t - t_0)',
                    proof: 'The coefficient t is an explicit function of time. Delayed input gives t · x(t - t₀), whereas delaying the original output gives (t - t₀) · x(t - t₀). The difference is t₀ · x(t - t₀) ≠ 0.',
                    toleranceExpected: 1e-4
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: 0,
                    testConditionLatex: 'y(t) \\text{ depends purely on } x(t)',
                    proof: 'The system computes the product of current time t and current input x(t). It does not require any future input x(t + Δt).'
                },
                stability: {
                    isStable: false,
                    verdictText: 'Not BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: '|x(t)| = 1 \\le M_x < \\infty \\implies |y(t)| = |t \\cdot 1| = |t| \\to \\infty \\text{ as } t \\to \\infty',
                    proof: 'Consider the bounded constant input x(t) = 1 (where Mx = 1). As t → ∞, y(t) = t → ∞, which is unbounded. Hence, the system is NOT BIBO stable.'
                }
            }
        },

        abs: {
            id: 'abs',
            number: 5,
            name: 'Absolute Value',
            latex: 'y(t) = |x(t)|',
            shortFormula: '|x(t)|',
            description: 'Computes the absolute value (full-wave rectification) of the input signal.',
            operation: 'abs',
            parameters: {},

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => Math.abs(fn(t)));
            },

            evaluateArray: (xValues) => {
                return xValues.map(x => Math.abs(x));
            },

            expectedProperties: {
                linearity: {
                    isLinear: false,
                    verdictText: 'Non-linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = |a x_1 + b x_2| \\ne a|x_1| + b|x_2|',
                    proof: 'Due to the triangle inequality, |x₁ + x₂| ≤ |x₁| + |x₂|, equality does not hold in general (e.g. for x₁ = 1, x₂ = -1, |1 - 1| = 0 while |1| + |-1| = 2). Also T{-x} = | -x | = |x| ≠ -T{x}.',
                    toleranceExpected: 1e-4
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = |x(t - t_0)| = y(t - t_0)',
                    proof: 'The absolute value operation is instantaneous and independent of the time origin. Shifting the input simply shifts the rectified output.',
                    toleranceExpected: 1e-6
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: 0,
                    testConditionLatex: 'y(t) \\text{ depends solely on current } x(t)',
                    proof: 'The output at any instant t requires only the magnitude of the signal at that same instant t.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 1,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| = ||x(t)|| = |x(t)| \\le M_x < \\infty',
                    proof: 'The absolute value of a bounded signal remains bounded by the exact same bound: My = Mx < ∞.'
                }
            }
        },

        diff: {
            id: 'diff',
            number: 6,
            name: 'Differentiator',
            latex: 'y(t) = \\frac{dx(t)}{dt}',
            shortFormula: 'dx/dt',
            description: 'Computes the instantaneous time derivative (rate of change) of the input signal.',
            operation: 'diff',
            parameters: {},

            evaluateFn: (fn, tArray) => {
                // High precision 2-point derivative with tiny delta
                const dt = 1e-4;
                return tArray.map(t => (fn(t) - fn(t - dt)) / dt);
            },

            evaluateArray: (xValues, tArray) => {
                return Utils.numericalDerivative(xValues, tArray);
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: '\\frac{d}{dt}[a x_1 + b x_2] = a \\frac{dx_1}{dt} + b \\frac{dx_2}{dt}',
                    proof: 'Differentiation is a linear operator. The derivative of a weighted sum equals the weighted sum of the individual derivatives.',
                    toleranceExpected: 1e-3
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: '\\frac{d}{dt}[x(t - t_0)] = x\'(t - t_0) = y(t - t_0)',
                    proof: 'By the chain rule, d/dt[x(t - t₀)] = x\'(t - t₀) · d(t - t₀)/dt = x\'(t - t₀), which equals delaying the derivative output by t₀.',
                    toleranceExpected: 1e-3
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal (Backward Limit)',
                    probeOffset: 0,
                    testConditionLatex: 'y(t) = \\lim_{\\Delta t \\to 0^+} \\frac{x(t) - x(t - \\Delta t)}{\\Delta t}',
                    proof: 'In practical continuous systems, the rate of change is defined via the backward limit using present (t) and immediately preceding past (t - Δt) samples. Hence, it is physically causal.'
                },
                stability: {
                    isStable: false,
                    verdictText: 'Not BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: 'x(t) = \\sin(\\omega t) \\ (|x| \\le 1) \\implies y(t) = \\omega \\cos(\\omega t) \\implies |y|_{max} = \\omega \\to \\infty',
                    proof: 'Even though x(t) = sin(ωt) is bounded with Mx = 1, its derivative y(t) = ω cos(ωt) has peak amplitude ω. As input frequency ω increases, output bound grows without limit. Discontinuous inputs (like step u(t)) also yield infinite impulse δ(t).'
                }
            }
        },

        integral: {
            id: 'integral',
            number: 7,
            name: 'Ideal Integrator',
            latex: 'y(t) = \\int_{-\\infty}^{t} x(\\tau) d\\tau',
            shortFormula: '\\int_{-\\infty}^t x(\\tau)d\\tau',
            description: 'Computes the running accumulation (integral) of the input signal from -∞ up to time t.',
            operation: 'integral',
            parameters: {},

            evaluateFn: (fn, tArray) => {
                // Compute signal array first, then trapezoidal integration
                const xVals = tArray.map(t => fn(t));
                return Utils.cumulativeIntegral(xVals, tArray, 0);
            },

            evaluateArray: (xValues, tArray) => {
                return Utils.cumulativeIntegral(xValues, tArray, 0);
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: '\\int_{-\\infty}^t [a x_1(\\tau) + b x_2(\\tau)] d\\tau = a \\int_{-\\infty}^t x_1(\\tau)d\\tau + b \\int_{-\\infty}^t x_2(\\tau)d\\tau',
                    proof: 'Integration is a linear integral operator satisfying both scaling and superposition.',
                    toleranceExpected: 1e-3
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: '\\int_{-\\infty}^t x(\\tau - t_0) d\\tau = \\int_{-\\infty}^{t - t_0} x(\\lambda) d\\lambda = y(t - t_0)',
                    proof: 'Substituting variable λ = τ - t₀ shows that integrating the delayed input yields the delayed original integral output.',
                    toleranceExpected: 1e-3
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: 0,
                    testConditionLatex: '\\text{Upper limit is } t, \\text{ so } \\tau \\le t',
                    proof: 'The integration window spans only up to current time t. Future values (τ > t) are never integrated, so the system is causal.'
                },
                stability: {
                    isStable: false,
                    verdictText: 'Not BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: 'x(t) = u(t) \\ (|x| \\le 1) \\implies y(t) = t \\cdot u(t) \\to \\infty \\text{ as } t \\to \\infty',
                    proof: 'For the bounded unit step input x(t) = u(t) (Mx = 1), the integrator produces a ramp y(t) = t · u(t), which diverges to infinity as t → ∞. The impulse response h(t) = u(t) is not absolutely integrable (∫ |u(t)| dt = ∞).'
                }
            }
        },

        advance: {
            id: 'advance',
            number: 8,
            name: 'Time Advance',
            latex: 'y(t) = x(t + 2)',
            shortFormula: 'x(t + 2)',
            description: 'Advances the input signal by 2 seconds into the future.',
            operation: 'advance',
            parameters: { advanceAmount: 2 },

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => fn(t + 2));
            },

            evaluateArray: (xValues, tArray) => {
                return tArray.map(t => Utils.interpolate(t + 2, tArray, xValues, 0));
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = a x_1(t + 2) + b x_2(t + 2) = a T\\{x_1\\} + b T\\{x_2\\}',
                    proof: 'Advancing a sum of signals yields the sum of individually advanced signals. Superposition holds identically.',
                    toleranceExpected: 1e-5
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = x((t - t_0) + 2) = x((t + 2) - t_0) = y(t - t_0)',
                    proof: 'Shifting the input and applying the advance operation yields identical results regardless of order.',
                    toleranceExpected: 1e-5
                },
                causality: {
                    isCausal: false,
                    verdictText: 'Non-Causal',
                    probeOffset: 2,
                    testConditionLatex: 'y(t) \\text{ requires } x(t + 2) \\text{ (future value, since } t + 2 > t\\text{)}',
                    proof: 'The output at time t requires the input value 2 time units in the FUTURE! For example, at t = 0, y(0) = x(2). A real-time physical system cannot know future inputs before they occur.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 1,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| = |x(t + 2)| \\le M_x < \\infty',
                    proof: 'A time advance merely shifts the occurrence time of values. It cannot amplify amplitude, so My = Mx < ∞.'
                }
            }
        }
    },

    /**
     * Get system definition by ID
     */
    get(systemId) {
        return this.definitions[systemId] || this.definitions.scale;
    },

    /**
     * List all systems as an array
     */
    list() {
        return Object.values(this.definitions);
    }
};

window.Systems = Systems;
