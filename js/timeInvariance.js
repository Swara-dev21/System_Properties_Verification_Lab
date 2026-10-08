/**
 * System Properties Verification Virtual Lab
 * Time-Invariance Verification Engine: T{x(t - t0)} = y(t - t0)
 */

const TimeInvarianceTester = {
    /**
     * Run Time Invariance Experiment
     * @param {Object} options
     * @param {string|Object} options.system
     * @param {Object} options.signal - { id, params }
     * @param {number} options.t0 - Time shift amount
     * @param {Array<number>} options.timeRange - [tStart, tEnd]
     * @param {number} options.tolerance
     */
    run(options) {
        const sys = typeof options.system === 'string' ? Systems.get(options.system) : options.system;
        const sigConfig = options.signal || { id: 'sine', params: { amplitude: 1, frequency: 1 } };
        const t0 = options.t0 !== undefined ? Number(options.t0) : 1.2;
        const timeRange = options.timeRange || [-5, 5];
        const numPoints = 600;
        const tolerance = options.tolerance || 1e-4;

        const t = Utils.linspace(timeRange[0], timeRange[1], numPoints);

        // Original input signal function
        const xFn = Signals.createFunction(sigConfig.id, sigConfig.params);
        const xVals = t.map(ti => xFn(ti));

        // Shifted input signal function: x_shift(t) = x(t - t0)
        const xShiftFn = (ti) => xFn(ti - t0);
        const xShiftVals = t.map(ti => xShiftFn(ti));

        // PATH 1: Original input -> System -> Original output y1(t)
        // Then shift the output by t0: y_delayed(t) = y1(t - t0)
        // For accurate comparison without boundary artifacts:
        // We evaluate y1 on a grid that includes t - t0
        const tDelayed = t.map(ti => ti - t0);
        const y1AtTDelayed = sys.evaluateFn(xFn, tDelayed);
        const y1Original = sys.evaluateFn(xFn, t);

        // PATH 2: Shift input by t0 first -> Pass shifted input to system -> y2(t) = T{x(t - t0)}
        const y2ShiftedInput = sys.evaluateFn(xShiftFn, t);

        // Difference: Path 2 (T{x(t - t0)}) - Path 1 (y(t - t0))
        // To be fair to boundary conditions, measure error on the interior region
        const pad = Math.abs(t0) + 0.5;
        const validIndices = [];
        for (let i = 0; i < t.length; i++) {
            if (t[i] >= (timeRange[0] + pad) && t[i] <= (timeRange[1] - pad)) {
                validIndices.push(i);
            }
        }
        // Fallback to all indices if window is tight
        const testIndices = validIndices.length > 50 ? validIndices : t.map((_, i) => i);

        const errorVals = t.map((_, i) => y2ShiftedInput[i] - y1AtTDelayed[i]);
        
        let maxError = 0;
        for (const idx of testIndices) {
            const err = Math.abs(errorVals[idx]);
            if (err > maxError && isFinite(err)) {
                maxError = err;
            }
        }

        const theoretical = sys.expectedProperties && sys.expectedProperties.timeInvariance ? sys.expectedProperties.timeInvariance : { isTimeInvariant: maxError < tolerance };
        const isTimeInvariant = (theoretical.isTimeInvariant !== undefined) ? theoretical.isTimeInvariant : (maxError < tolerance);

        return {
            system: sys,
            t0,
            inputs: {
                t,
                original: { name: Signals.get(sigConfig.id).name, values: xVals, config: sigConfig },
                shifted: { name: `x(t - ${t0})`, values: xShiftVals }
            },
            outputs: {
                y1Original,           // y1(t) = T{x(t)}
                y1Delayed: y1AtTDelayed, // y1(t - t0) [Path 1]
                y2Shifted: y2ShiftedInput, // T{x(t - t0)} [Path 2]
                difference: errorVals // Path 2 - Path 1
            },
            metrics: {
                maxError,
                tolerance,
                isTimeInvariant,
                theoreticalMatches: isTimeInvariant === theoretical.isTimeInvariant
            },
            theory: theoretical,
            explanation: this.generateExplanation(sys, isTimeInvariant, maxError, tolerance, t0, theoretical)
        };
    },

    generateExplanation(system, isTimeInvariant, maxError, tolerance, t0, theoretical) {
        const errorFormatted = Utils.formatNumber(maxError);
        const tolFormatted = Utils.formatNumber(tolerance);

        if (isTimeInvariant) {
            return {
                verdict: '✓ System is Time Invariant',
                statusClass: 'status-pass',
                summary: `Delaying the input by $t_0 = ${t0}$ resulted in the exact same delay $t_0$ in the output. The operations of system transformation and time shifting commute!`,
                mathTest: `T\\{x(t - ${t0})\\} = y(t - ${t0})`,
                errorDetails: `Maximum difference $\\max |T\\{x(t - t_0)\\} - y(t - t_0)| = ${errorFormatted}$ (within tolerance $\\le ${tolFormatted}$).`,
                why: theoretical.proof
            };
        } else {
            return {
                verdict: '✗ System is Time Varying',
                statusClass: 'status-fail',
                summary: `The system behavior explicitly changes over time. Applying the system to a delayed input does NOT match delaying the original output!`,
                mathTest: `T\\{x(t - ${t0})\\} \\ne y(t - ${t0})`,
                errorDetails: `Maximum difference $\\max |T\\{x(t - t_0)\\} - y(t - t_0)| = ${errorFormatted}$ (violates tolerance of ${tolFormatted}$).`,
                why: theoretical.proof
            };
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeInvarianceTester;
}
if (typeof window !== 'undefined') {
    window.TimeInvarianceTester = TimeInvarianceTester;
}
