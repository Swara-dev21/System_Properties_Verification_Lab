/**
 * System Properties Verification Virtual Lab
 * Linearity Verification Engine: T{a*x1(t) + b*x2(t)} = a*T{x1(t)} + b*T{x2(t)}
 */

const LinearityTester = {
    /**
     * Run the complete Linearity Experiment
     * @param {Object} options
     * @param {string|Object} options.system - System ID or object
     * @param {Object} options.signal1 - { id, params }
     * @param {Object} options.signal2 - { id, params }
     * @param {number} options.a - Weight for signal 1
     * @param {number} options.b - Weight for signal 2
     * @param {Array<number>} options.timeRange - [tStart, tEnd]
     * @param {number} options.tolerance - Numerical tolerance threshold
     */
    run(options) {
        const sys = typeof options.system === 'string' ? Systems.get(options.system) : options.system;
        const sig1Config = options.signal1 || { id: 'sine', params: { amplitude: 1, frequency: 1 } };
        const sig2Config = options.signal2 || { id: 'cosine', params: { amplitude: 1, frequency: 1 } };
        const a = options.a !== undefined ? Number(options.a) : 1.0;
        const b = options.b !== undefined ? Number(options.b) : 1.0;
        const timeRange = options.timeRange || [-4, 4];
        const numPoints = 600;
        const tolerance = options.tolerance || 1e-4;

        const t = Utils.linspace(timeRange[0], timeRange[1], numPoints);

        // Continuous signal functions
        const x1Fn = Signals.createFunction(sig1Config.id, sig1Config.params);
        const x2Fn = Signals.createFunction(sig2Config.id, sig2Config.params);

        // Individual signal sample arrays
        const x1Vals = t.map(ti => x1Fn(ti));
        const x2Vals = t.map(ti => x2Fn(ti));

        // Combined input signal: x_comb(t) = a * x1(t) + b * x2(t)
        const xCombFn = (ti) => a * x1Fn(ti) + b * x2Fn(ti);
        const xCombVals = t.map(ti => xCombFn(ti));

        // Path 1 (LHS): Apply system to combined input -> T{a*x1 + b*x2}
        const yLHS = sys.evaluateFn(xCombFn, t);

        // Path 2 (RHS): Apply system to each input, scale and sum -> a*T{x1} + b*T{x2}
        const y1Vals = sys.evaluateFn(x1Fn, t);
        const y2Vals = sys.evaluateFn(x2Fn, t);
        const yRHS = t.map((_, i) => a * y1Vals[i] + b * y2Vals[i]);

        // Error signal: Difference = LHS - RHS
        const errorVals = t.map((_, i) => yLHS[i] - yRHS[i]);
        const maxError = Utils.maxAbs(errorVals);

        // Scale-aware threshold
        const peakOutput = Math.max(Utils.maxAbs(yLHS), Utils.maxAbs(yRHS), 1.0);
        const relativeError = maxError / peakOutput;
        const isLinear = maxError < tolerance;

        // Theoretical reference comparison
        const theoretical = sys.expectedProperties.linearity;

        return {
            system: sys,
            inputs: {
                t,
                x1: { name: Signals.get(sig1Config.id).name, values: x1Vals, a, config: sig1Config },
                x2: { name: Signals.get(sig2Config.id).name, values: x2Vals, b, config: sig2Config },
                combined: { values: xCombVals }
            },
            outputs: {
                y1: y1Vals,
                y2: y2Vals,
                lhs: yLHS, // T{a*x1 + b*x2}
                rhs: yRHS, // a*T{x1} + b*T{x2}
                difference: errorVals
            },
            metrics: {
                maxError,
                relativeError,
                tolerance,
                isLinear,
                theoreticalMatches: isLinear === theoretical.isLinear
            },
            theory: theoretical,
            explanation: this.generateExplanation(sys, isLinear, maxError, tolerance, a, b, theoretical)
        };
    },

    generateExplanation(system, isLinear, maxError, tolerance, a, b, theoretical) {
        const errorFormatted = Utils.formatNumber(maxError);
        const tolFormatted = Utils.formatNumber(tolerance);

        if (isLinear) {
            return {
                verdict: '✓ System is Linear',
                statusClass: 'status-pass',
                summary: `The superposition test verified that $T\\{a x_1(t) + b x_2(t)\\} = a T\\{x_1(t)\\} + b T\\{x_2(t)\\}$.`,
                mathTest: `\\text{LHS} = T\\{${a} x_1(t) + ${b} x_2(t)\\} \\quad \\text{vs} \\quad \\text{RHS} = ${a}T\\{x_1(t)\\} + ${b}T\\{x_2(t)\\}`,
                errorDetails: `Maximum difference $\\max |\\text{LHS} - \\text{RHS}| = ${errorFormatted}$ (within tolerance $\\le ${tolFormatted}$).`,
                why: theoretical.proof
            };
        } else {
            return {
                verdict: '✗ System is Non-linear',
                statusClass: 'status-fail',
                summary: `The superposition principle was violated. The system output for the combined input does NOT match the sum of individual outputs.`,
                mathTest: `\\text{LHS} = T\\{${a} x_1(t) + ${b} x_2(t)\\} \\ne \\text{RHS} = ${a}T\\{x_1(t)\\} + ${b}T\\{x_2(t)\\}`,
                errorDetails: `Maximum difference $\\max |\\text{LHS} - \\text{RHS}| = ${errorFormatted}$ (exceeds tolerance of ${tolFormatted}$).`,
                why: theoretical.proof
            };
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinearityTester;
}
if (typeof window !== 'undefined') {
    window.LinearityTester = LinearityTester;
}
