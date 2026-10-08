/**
 * System Properties Verification Virtual Lab
 * Practice Mode / Quiz & Assessment Module (Section 14)
 */

const PracticeManager = {
    questions: [
        {
            id: 'q1',
            latex: 'y(t) = x(t - 2)',
            title: 'Time-Delayed Signal',
            hint: 'Recall what a time shift in the past implies for causality and memory.',
            systemId: 'delay',
            answers: {
                linearity: 'linear',
                causality: 'causal',
                stability: 'stable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'dynamic'
            },
            explanations: {
                linearity: 'Linear: Delaying a weighted sum delays each component linearly: T{a*x1 + b*x2} = a*x1(t-2) + b*x2(t-2).',
                causality: 'Causal: At any time t, the output requires x(t - 2). Since t - 2 < t, it only requires past values.',
                stability: 'BIBO Stable: Shifting in time does not amplify the amplitude; |y(t)| = |x(t-2)| <= Mx < infinity.',
                timeInvariance: 'Time-Invariant: The time shift operator commutes with time shifts: T{x(t - t0)} = x(t - t0 - 2) = y(t - t0).',
                staticDynamic: 'Dynamic (With Memory): To produce output at time t, the system must store past values from t - 2.'
            }
        },
        {
            id: 'q2',
            latex: 'y(t) = 3x(t)',
            title: 'Linear Amplifier',
            hint: 'A pure resistive scaling with constant gain.',
            systemId: 'scale',
            answers: {
                linearity: 'linear',
                causality: 'causal',
                stability: 'stable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'static'
            },
            explanations: {
                linearity: 'Linear: Scaling is homogeneous and additive: 3(a*x1 + b*x2) = 3a*x1 + 3b*x2.',
                causality: 'Causal: Output at t depends strictly on current x(t).',
                stability: 'BIBO Stable: For any bounded input |x(t)| <= Mx, |y(t)| <= 3Mx < infinity.',
                timeInvariance: 'Time-Invariant: The gain 3 does not vary with time.',
                staticDynamic: 'Static (Memoryless): Depends solely on input at the current instant t.'
            }
        },
        {
            id: 'q3',
            latex: 'y(t) = x^2(t)',
            title: 'Squaring Multiplier',
            hint: 'Think about (a + b)^2 vs a^2 + b^2.',
            systemId: 'square',
            answers: {
                linearity: 'nonlinear',
                causality: 'causal',
                stability: 'stable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'static'
            },
            explanations: {
                linearity: 'Non-linear: Expanding (x1 + x2)^2 produces cross-term 2*x1*x2, violating superposition.',
                causality: 'Causal: Output at t depends strictly on current x(t).',
                stability: 'BIBO Stable: If |x(t)| <= Mx, then |y(t)| <= Mx^2 < infinity.',
                timeInvariance: 'Time-Invariant: Shifting input yields [x(t - t0)]^2 = y(t - t0).',
                staticDynamic: 'Static (Memoryless): Instantaneous squarer with zero energy storage.'
            }
        },
        {
            id: 'q4',
            latex: 'y(t) = x(t + 1)',
            title: 'Time Advance',
            hint: 'Can a physical system know the future before it occurs?',
            systemId: 'advance',
            answers: {
                linearity: 'linear',
                causality: 'non_causal',
                stability: 'stable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'dynamic'
            },
            explanations: {
                linearity: 'Linear: Superposition holds identically for time advances.',
                causality: 'Non-Causal: At time t, requires future input x(t + 1) where t + 1 > t.',
                stability: 'BIBO Stable: Bound remains My = Mx < infinity.',
                timeInvariance: 'Time-Invariant: Advance operator commutes with time shifts.',
                staticDynamic: 'Dynamic (With Memory): Relies on non-coincident future time instant.'
            }
        },
        {
            id: 'q5',
            latex: 'y(t) = t \\cdot x(t)',
            title: 'Time-Varying Ramp Multiplier',
            hint: 'Notice the independent variable t acting as a coefficient.',
            systemId: 'time_scale',
            answers: {
                linearity: 'linear',
                causality: 'causal',
                stability: 'unstable',
                timeInvariance: 'time_variant',
                staticDynamic: 'static'
            },
            explanations: {
                linearity: 'Linear: Multiplication by t distributes: t(a*x1 + b*x2) = a(t*x1) + b(t*x2).',
                causality: 'Causal: Depends solely on input at current instant t.',
                stability: 'Unstable: For bounded constant input x(t) = 1, y(t) = t -> infinity as t -> infinity.',
                timeInvariance: 'Time-Variant: Explicit coefficient t changes over time: T{x(t - t0)} = t*x(t - t0) != (t - t0)*x(t - t0).',
                staticDynamic: 'Static (Memoryless): At instant t, only requires x(t). No memory needed despite time variation.'
            }
        },
        {
            id: 'q6',
            latex: 'y(t) = \\frac{dx(t)}{dt}',
            title: 'Continuous Differentiator',
            hint: 'Derivative measures rate of change over an infinitesimal interval.',
            systemId: 'diff',
            answers: {
                linearity: 'linear',
                causality: 'causal',
                stability: 'unstable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'dynamic'
            },
            explanations: {
                linearity: 'Linear: Derivative of a sum is the sum of derivatives.',
                causality: 'Causal: Backward limit uses present and preceding past samples.',
                stability: 'Unstable: For bounded high frequency sin(w*t), output amplitude w diverges as w -> infinity.',
                timeInvariance: 'Time-Invariant: Differentiating delayed input yields delayed derivative.',
                staticDynamic: 'Dynamic (With Memory): Finding slope requires knowledge of values across a neighborhood around t.'
            }
        },
        {
            id: 'q7',
            latex: 'y(t) = \\int_{-\\infty}^{t} x(\\tau)d\\tau',
            title: 'Continuous Ideal Integrator',
            hint: 'Integrator accumulates input from the beginning of time.',
            systemId: 'integral',
            answers: {
                linearity: 'linear',
                causality: 'causal',
                stability: 'unstable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'dynamic'
            },
            explanations: {
                linearity: 'Linear: Integration is a linear operator.',
                causality: 'Causal: Upper limit is t, so future inputs (tau > t) are never integrated.',
                stability: 'Unstable: For bounded step input u(t), output y(t) = t*u(t) grows without bound.',
                timeInvariance: 'Time-Invariant: Integrating delayed signal yields delayed integral output.',
                staticDynamic: 'Dynamic (With Memory): Accumulates energy over the entire past history.'
            }
        },
        {
            id: 'q8',
            latex: 'y(t) = x(2t)',
            title: 'Time Compression / Scaling',
            hint: 'What does playing at 2x speed do to positive time values?',
            systemId: 'compress',
            answers: {
                linearity: 'linear',
                causality: 'non_causal',
                stability: 'stable',
                timeInvariance: 'time_variant',
                staticDynamic: 'dynamic'
            },
            explanations: {
                linearity: 'Linear: Scaling the time axis distributes over linear combinations.',
                causality: 'Non-Causal: For t > 0 (e.g. t = 1), y(1) requires x(2) which is in the future.',
                stability: 'BIBO Stable: Time scaling does not alter amplitude peaks.',
                timeInvariance: 'Time-Variant: Shifting input gives x(2t - t0), but shifting output gives x(2(t - t0)) = x(2t - 2t0).',
                staticDynamic: 'Dynamic (With Memory): At t != 0, requires samples from 2t != t.'
            }
        },
        {
            id: 'q9',
            latex: 'y(t) = 2x(t) + 3',
            title: 'Affine System with Constant Offset',
            hint: 'What is the output when input is zero?',
            systemId: 'offset',
            answers: {
                linearity: 'nonlinear',
                causality: 'causal',
                stability: 'stable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'static'
            },
            explanations: {
                linearity: 'Non-linear: Violates homogeneity because zero input gives y(t) = 3 != 0.',
                causality: 'Causal: Requires only current input value.',
                stability: 'BIBO Stable: Peak is bounded by 2*Mx + 3 < infinity.',
                timeInvariance: 'Time-Invariant: Coefficients and offset 3 do not vary with time.',
                staticDynamic: 'Static (Memoryless): Instantaneous algebraic relation with no storage.'
            }
        },
        {
            id: 'q10',
            latex: 'y(t) = |x(t)|',
            title: 'Full-Wave Absolute Value Rectifier',
            hint: 'Check if | -x | = - | x |.',
            systemId: 'abs',
            answers: {
                linearity: 'nonlinear',
                causality: 'causal',
                stability: 'stable',
                timeInvariance: 'time_invariant',
                staticDynamic: 'static'
            },
            explanations: {
                linearity: 'Non-linear: Triangle inequality |x1 + x2| <= |x1| + |x2|; also T{-x} = | -x | = |x| != -T{x}.',
                causality: 'Causal: Magnitude evaluated at current instant t.',
                stability: 'BIBO Stable: |y(t)| = |x(t)| <= Mx < infinity.',
                timeInvariance: 'Time-Invariant: Rectification behavior does not change over time.',
                staticDynamic: 'Static (Memoryless): Purely instantaneous value operation.'
            }
        }
    ],

    currentIndex: 0,
    stats: {
        totalAnswered: 0,
        totalCorrect: 0,
        scoreHistory: []
    },

    getCurrentQuestion() {
        return this.questions[this.currentIndex];
    },

    nextQuestion() {
        this.currentIndex = (this.currentIndex + 1) % this.questions.length;
        return this.getCurrentQuestion();
    },

    previousQuestion() {
        this.currentIndex = (this.currentIndex - 1 + this.questions.length) % this.questions.length;
        return this.getCurrentQuestion();
    },

    setQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            this.currentIndex = index;
        }
        return this.getCurrentQuestion();
    },

    /**
     * Check user submitted answers
     * @param {Object} userAnswers - { linearity, causality, stability, timeInvariance, staticDynamic }
     */
    evaluateSubmission(userAnswers) {
        const q = this.getCurrentQuestion();
        const results = {};
        let score = 0;

        const properties = ['linearity', 'causality', 'stability', 'timeInvariance', 'staticDynamic'];

        properties.forEach(prop => {
            const expected = q.answers[prop];
            const actual = userAnswers[prop];
            const isCorrect = actual === expected;
            if (isCorrect) score++;

            results[prop] = {
                userAnswer: actual,
                expectedAnswer: expected,
                isCorrect,
                explanation: q.explanations[prop]
            };
        });

        this.stats.totalAnswered++;
        this.stats.totalCorrect += (score === 5 ? 1 : 0);
        this.stats.scoreHistory.push({ questionId: q.id, score, max: 5 });

        return {
            question: q,
            score,
            maxScore: 5,
            percentage: Math.round((score / 5) * 100),
            results,
            isPerfect: score === 5
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PracticeManager;
}
if (typeof window !== 'undefined') {
    window.PracticeManager = PracticeManager;
}
