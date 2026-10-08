/**
 * System Properties Verification Virtual Lab
 * System Definitions and Mathematical Operations
 * Covers all 5 Fundamental System Properties:
 * 1. Linearity
 * 2. Time Invariance
 * 3. Causality
 * 4. BIBO Stability
 * 5. Static / Dynamic (Memoryless vs With Memory)
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
            
            evaluateFn: (fn, tArray) => {
                return tArray.map(t => 2 * fn(t));
            },

            evaluateArray: (xValues) => {
                return xValues.map(x => 2 * x);
            },

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
                },
                staticDynamic: {
                    isStatic: true,
                    verdictText: 'Static (Memoryless)',
                    testConditionLatex: 'y(t) = f(x(t)) \\text{ with no time delays or storage elements}',
                    proof: 'The output at time t depends solely on the input at the exact same instant t. The system has no memory of past or future values.'
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
                    proof: 'Expanding (a x₁ + b x₂)² yields a² x₁² + 2ab x₁x₂ + b² x₂². The cross term 2ab x₁x₂ violates superposition. Thus, it fails linearity.',
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
                    testConditionLatex: 'y(t) \\text{ depends solely on current } x(t)',
                    proof: 'The output at time t depends purely on the input at the current time t. It is a memoryless, causal system.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: '|x(t)| \\le M_x < \\infty \\implies |y(t)| = |x(t)|^2 \\le M_x^2 < \\infty',
                    proof: 'If the input magnitude is strictly bounded by Mx, the output is bounded by My = Mx², which is finite.'
                },
                staticDynamic: {
                    isStatic: true,
                    verdictText: 'Static (Memoryless)',
                    testConditionLatex: 'y(t) = [x(t)]^2 \\text{ evaluates at instantaneous } t',
                    proof: 'The output at any time t is purely determined by the value of x(t) at that exact instant. No past or future memory is required.'
                }
            }
        },

        delay: {
            id: 'delay',
            number: 3,
            name: 'Time Delay',
            latex: 'y(t) = x(t - 1)',
            shortFormula: 'x(t - 1)',
            description: 'Delays the input signal by 1 second in time.',
            operation: 'delay',
            parameters: { delayAmount: 1 },

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => fn(t - 1));
            },

            evaluateArray: (xValues, tArray) => {
                return tArray.map(t => Utils.interpolate(t - 1, tArray, xValues, 0));
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = a x_1(t - 1) + b x_2(t - 1) = a T\\{x_1\\} + b T\\{x_2\\}',
                    proof: 'Time-delaying a linear combination of signals delays each component identically. Superposition holds exactly.',
                    toleranceExpected: 1e-5
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = x((t - t_0) - 1) = x((t - 1) - t_0) = y(t - t_0)',
                    proof: 'Shifting the input by t₀ and then delaying by 1 gives x(t - 1 - t₀), which equals delaying first and shifting by t₀.',
                    toleranceExpected: 1e-5
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: -1,
                    testConditionLatex: 'y(t) \\text{ requires } x(t - 1) \\text{ (past value since } t - 1 < t\\text{)}',
                    proof: 'The output at time t requires the input from 1 time unit in the PAST (t - 1). Since past values are already known, the system is causal.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 1,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| = |x(t - 1)| \\le M_x < \\infty',
                    proof: 'Time-shifting a signal only changes when values occur, not their peak amplitudes. The bound remains My = Mx.'
                },
                staticDynamic: {
                    isStatic: false,
                    verdictText: 'Dynamic (With Memory)',
                    testConditionLatex: 'y(t) = x(t - 1) \\ne f(x(t))',
                    proof: 'The system has memory! To calculate output at current time t, the system must store and recall the past value of input from t - 1.'
                }
            }
        },

        advance: {
            id: 'advance',
            number: 4,
            name: 'Time Advance',
            latex: 'y(t) = x(t + 1)',
            shortFormula: 'x(t + 1)',
            description: 'Advances the input signal by 1 second into the future.',
            operation: 'advance',
            parameters: { advanceAmount: 1 },

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => fn(t + 1));
            },

            evaluateArray: (xValues, tArray) => {
                return tArray.map(t => Utils.interpolate(t + 1, tArray, xValues, 0));
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = a x_1(t + 1) + b x_2(t + 1) = a T\\{x_1\\} + b T\\{x_2\\}',
                    proof: 'Advancing a sum of signals yields the sum of individually advanced signals. Superposition holds identically.',
                    toleranceExpected: 1e-5
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = x((t - t_0) + 1) = x((t + 1) - t_0) = y(t - t_0)',
                    proof: 'Shifting the input and applying the advance operation yields identical results regardless of order.',
                    toleranceExpected: 1e-5
                },
                causality: {
                    isCausal: false,
                    verdictText: 'Non-Causal',
                    probeOffset: 1,
                    testConditionLatex: 'y(t) \\text{ requires } x(t + 1) \\text{ (future value, since } t + 1 > t\\text{)}',
                    proof: 'The output at time t requires the input value 1 second in the FUTURE! For example, at t = 0, y(0) = x(1). A real-time physical system cannot predict future inputs.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 1,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| = |x(t + 1)| \\le M_x < \\infty',
                    proof: 'A time advance merely shifts the occurrence time of values. It cannot amplify amplitude, so My = Mx < ∞.'
                },
                staticDynamic: {
                    isStatic: false,
                    verdictText: 'Dynamic (With Memory)',
                    testConditionLatex: 'y(t) = x(t + 1) \\ne f(x(t))',
                    proof: 'Dynamic system: the output depends on non-coincident time values (future instant t + 1), which means it does not depend solely on current x(t).'
                }
            }
        },

        time_scale: {
            id: 'time_scale',
            number: 5,
            name: 'Time Multiplier System',
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
                },
                staticDynamic: {
                    isStatic: true,
                    verdictText: 'Static (Memoryless)',
                    testConditionLatex: 'y(t) = t \\cdot x(t) \\text{ requires only the instantaneous sample } x(t)',
                    proof: 'Even though it is time-variant, it is MEMORYLESS (Static). At any instant t = t₀, the output y(t₀) = t₀ · x(t₀) depends strictly on x(t₀), not on past or future values.'
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
                    proof: 'In physical continuous systems, the rate of change is evaluated via backward differences using present (t) and past (t - Δt) samples. Hence causal.'
                },
                stability: {
                    isStable: false,
                    verdictText: 'Not BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: 'x(t) = \\sin(\\omega t) \\ (|x| \\le 1) \\implies y(t) = \\omega \\cos(\\omega t) \\implies |y|_{max} = \\omega \\to \\infty',
                    proof: 'Even though x(t) = sin(ωt) is bounded with Mx = 1, its derivative y(t) = ω cos(ωt) has peak amplitude ω. As input frequency ω increases, output bound grows without limit.'
                },
                staticDynamic: {
                    isStatic: false,
                    verdictText: 'Dynamic (With Memory)',
                    testConditionLatex: 'y(t) = \\lim_{\\Delta t \\to 0} \\frac{x(t) - x(t - \\Delta t)}{\\Delta t}',
                    proof: 'Dynamic (With Memory): Finding the rate of change requires knowledge of signal values across an infinitesimal time interval around t, not just a single isolated point.'
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
                    testConditionLatex: '\\int_{-\\infty}^t [a x_1 + b x_2] d\\tau = a \\int_{-\\infty}^t x_1 d\\tau + b \\int_{-\\infty}^t x_2 d\\tau',
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
                    proof: 'For the bounded unit step input x(t) = u(t) (Mx = 1), the integrator produces an unbounded ramp y(t) = t · u(t) that diverges to infinity.'
                },
                staticDynamic: {
                    isStatic: false,
                    verdictText: 'Dynamic (With Memory)',
                    testConditionLatex: 'y(t) = \\int_{-\\infty}^t x(\\tau)d\\tau \\text{ depends on entire past history}',
                    proof: 'Dynamic (With Memory): An integrator stores energy (like a capacitor accumulating charge). The output at time t depends on all past inputs from -∞ up to t.'
                }
            }
        },

        abs: {
            id: 'abs',
            number: 8,
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
                    proof: 'Due to triangle inequality, |x₁ + x₂| ≤ |x₁| + |x₂|, equality does not hold in general. Furthermore T{-x} = |-x| = |x| ≠ -T{x}.',
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
                },
                staticDynamic: {
                    isStatic: true,
                    verdictText: 'Static (Memoryless)',
                    testConditionLatex: 'y(t) = |x(t)| \\text{ is purely instantaneous}',
                    proof: 'Static (Memoryless): The output y(t) at any time instant t is directly computed from the input x(t) at that exact same time instant.'
                }
            }
        },

        compress: {
            id: 'compress',
            number: 9,
            name: 'Time Scaling (Compression)',
            latex: 'y(t) = x(2t)',
            shortFormula: 'x(2t)',
            description: 'Compresses the signal in time by a factor of 2 (plays 2x faster).',
            operation: 'compress',
            parameters: { scale: 2 },

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => fn(2 * t));
            },

            evaluateArray: (xValues, tArray) => {
                return tArray.map(t => Utils.interpolate(2 * t, tArray, xValues, 0));
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = a x_1(2t) + b x_2(2t) = a T\\{x_1\\} + b T\\{x_2\\}',
                    proof: 'Superposition holds: compressing a sum of signals compresses each individual component identically.',
                    toleranceExpected: 1e-5
                },
                timeInvariance: {
                    isTimeInvariant: false,
                    verdictText: 'Time Varying',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = x(2t - t_0) \\ne x(2(t - t_0)) = x(2t - 2t_0) = y(t - t_0)',
                    proof: 'Delayed input yields x(2t - t₀), whereas delaying the output yields x(2(t - t₀)) = x(2t - 2t₀). Since 2t₀ ≠ t₀, the system is time-variant!',
                    toleranceExpected: 1e-4
                },
                causality: {
                    isCausal: false,
                    verdictText: 'Non-Causal',
                    probeOffset: 1,
                    testConditionLatex: 'y(1) = x(2) \\text{ requires future input for } t > 0',
                    proof: 'For any positive time t > 0, the output y(t) requires x(2t), which is ahead in time (2t > t). For example, at t = 1, y(1) requires x(2), making it non-causal.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 1,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| = |x(2t)| \\le M_x < \\infty',
                    proof: 'Time scaling alters when values occur, not their peak amplitudes. The bound remains My = Mx.'
                },
                staticDynamic: {
                    isStatic: false,
                    verdictText: 'Dynamic (With Memory)',
                    testConditionLatex: 'y(t) = x(2t) \\ne f(x(t)) \\text{ for } t \\ne 0',
                    proof: 'Dynamic (With Memory): At any time t ≠ 0, 2t ≠ t. The system requires input from a time instant different from current t, requiring memory.'
                }
            }
        },

        reversal: {
            id: 'reversal',
            number: 10,
            name: 'Time Reversal (Inversion)',
            latex: 'y(t) = x(-t)',
            shortFormula: 'x(-t)',
            description: 'Reflects the input signal horizontally around the vertical time axis t = 0.',
            operation: 'reversal',
            parameters: {},

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => fn(-t));
            },

            evaluateArray: (xValues, tArray) => {
                return tArray.map(t => Utils.interpolate(-t, tArray, xValues, 0));
            },

            expectedProperties: {
                linearity: {
                    isLinear: true,
                    verdictText: 'Linear',
                    testConditionLatex: 'T\\{a x_1 + b x_2\\} = a x_1(-t) + b x_2(-t) = a T\\{x_1\\} + b T\\{x_2\\}',
                    proof: 'Time reversal satisfies superposition: reversing a combination reverses both individual signals.',
                    toleranceExpected: 1e-5
                },
                timeInvariance: {
                    isTimeInvariant: false,
                    verdictText: 'Time Varying',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = x(-t - t_0) \\ne x(-(t - t_0)) = x(-t + t_0) = y(t - t_0)',
                    proof: 'Delayed input yields x(-t - t₀), whereas delayed output yields x(-t + t₀). The signs differ, so it is time-varying.',
                    toleranceExpected: 1e-4
                },
                causality: {
                    isCausal: false,
                    verdictText: 'Non-Causal',
                    probeOffset: 1,
                    testConditionLatex: 'y(-1) = x(1) \\text{ requires future input for negative } t',
                    proof: 'For t < 0, say t = -2, y(-2) requires x(2), which is in the future relative to t = -2. Therefore, it is non-causal.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: 1,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| = |x(-t)| \\le M_x < \\infty',
                    proof: 'Time reflection does not affect amplitude bounds. If |x(t)| ≤ Mx, then |y(t)| ≤ Mx.'
                },
                staticDynamic: {
                    isStatic: false,
                    verdictText: 'Dynamic (With Memory)',
                    testConditionLatex: 'y(t) = x(-t) \\ne f(x(t)) \\text{ for } t \\ne 0',
                    proof: 'Dynamic (With Memory): At all times other than t = 0, -t ≠ t. Output at t relies on non-coincident time values.'
                }
            }
        },

        offset: {
            id: 'offset',
            number: 11,
            name: 'Affine Scaling + Offset',
            latex: 'y(t) = 2x(t) + 3',
            shortFormula: '2x(t) + 3',
            description: 'Scales the signal and adds a non-zero DC constant bias offset.',
            operation: 'offset',
            parameters: { factor: 2, offset: 3 },

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => 2 * fn(t) + 3);
            },

            evaluateArray: (xValues) => {
                return xValues.map(x => 2 * x + 3);
            },

            expectedProperties: {
                linearity: {
                    isLinear: false,
                    verdictText: 'Non-linear',
                    testConditionLatex: 'T\\{0\\} = 2(0) + 3 = 3 \\ne 0',
                    proof: 'Fails homogeneity! Any linear system must satisfy T{0} = 0. Here, zero input produces y(t) = 3 ≠ 0. Also T{x₁ + x₂} = 2x₁ + 2x₂ + 3 ≠ (2x₁ + 3) + (2x₂ + 3) = 2x₁ + 2x₂ + 6.',
                    toleranceExpected: 1e-4
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = 2x(t - t_0) + 3 = y(t - t_0)',
                    proof: 'The constant gain and offset are time-independent. Shifting the input delays the output identically.',
                    toleranceExpected: 1e-6
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: 0,
                    testConditionLatex: 'y(t) \\text{ depends solely on current } x(t)',
                    proof: 'The output at any instant t relies solely on current x(t) and a fixed constant 3.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: '|x(t)| \\le M_x \\implies |y(t)| \\le 2M_x + 3 < \\infty',
                    proof: 'For any bounded input with peak Mx, the output peak cannot exceed 2Mx + 3, which is finite.'
                },
                staticDynamic: {
                    isStatic: true,
                    verdictText: 'Static (Memoryless)',
                    testConditionLatex: 'y(t) = 2x(t) + 3 \\text{ depends solely on current } x(t)',
                    proof: 'Static (Memoryless): y(t) requires no past or future inputs and contains no storage components.'
                }
            }
        },

        exp_op: {
            id: 'exp_op',
            number: 12,
            name: 'Exponential Operator',
            latex: 'y(t) = e^{x(t)}',
            shortFormula: 'e^{x(t)}',
            description: 'Computes the mathematical exponential of the input signal amplitude.',
            operation: 'exp',
            parameters: {},

            evaluateFn: (fn, tArray) => {
                return tArray.map(t => Math.exp(fn(t)));
            },

            evaluateArray: (xValues) => {
                return xValues.map(x => Math.exp(x));
            },

            expectedProperties: {
                linearity: {
                    isLinear: false,
                    verdictText: 'Non-linear',
                    testConditionLatex: 'T\\{x_1 + x_2\\} = e^{x_1 + x_2} = e^{x_1} \\cdot e^{x_2} \\ne e^{x_1} + e^{x_2}',
                    proof: 'Exponential operation transforms a sum into a product: e^(x₁ + x₂) = e^x₁ · e^x₂ ≠ e^x₁ + e^x₂. Violates superposition.',
                    toleranceExpected: 1e-4
                },
                timeInvariance: {
                    isTimeInvariant: true,
                    verdictText: 'Time Invariant',
                    testConditionLatex: 'T\\{x(t - t_0)\\} = e^{x(t - t_0)} = y(t - t_0)',
                    proof: 'The exponential operation is time-independent. Shifting input shifts output identically.',
                    toleranceExpected: 1e-6
                },
                causality: {
                    isCausal: true,
                    verdictText: 'Causal',
                    probeOffset: 0,
                    testConditionLatex: 'y(t) \\text{ depends solely on current } x(t)',
                    proof: 'The output at any time t is strictly a function of the input amplitude at time t.'
                },
                stability: {
                    isStable: true,
                    verdictText: 'BIBO Stable',
                    boundMultiplier: null,
                    testConditionLatex: '|x(t)| \\le M_x < \\infty \\implies |y(t)| \\le e^{M_x} < \\infty',
                    proof: 'If |x(t)| ≤ Mx < ∞, then y(t) = e^x(t) ≤ e^Mx < ∞. The output remains strictly bounded.'
                },
                staticDynamic: {
                    isStatic: true,
                    verdictText: 'Static (Memoryless)',
                    testConditionLatex: 'y(t) = e^{x(t)} \\text{ is instantaneous}',
                    proof: 'Static (Memoryless): Depends solely on the input value at that exact instant with zero memory.'
                }
            }
        }
    },

    /**
     * Get system definition by ID or compile if custom expression
     */
    get(systemId) {
        if (!systemId) return this.definitions.scale;

        // If systemId matches a predefined system
        if (this.definitions[systemId]) {
            return this.definitions[systemId];
        }

        // If passed an object directly
        if (typeof systemId === 'object' && systemId.evaluateFn) {
            return systemId;
        }

        // If passed a formula string (e.g. "3*x(t)" or "x(t-2)")
        if (typeof systemId === 'string' && typeof Utils !== 'undefined' && Utils.compileSystemExpr) {
            const compiled = Utils.compileSystemExpr(systemId);
            if (compiled.success) {
                return compiled;
            }
        }

        return this.definitions.scale;
    },

    /**
     * List all predefined systems as an array
     */
    list() {
        return Object.values(this.definitions);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Systems;
}
if (typeof window !== 'undefined') {
    window.Systems = Systems;
}
