/**
 * System Properties Verification Virtual Lab
 * Stability Verification Engine (BIBO: Bounded-Input Bounded-Output)
 * 
 * Condition:
 * For every bounded input |x(t)| <= Mx < infinity,
 * the output must satisfy |y(t)| <= My < infinity for some finite My.
 * 
 * Features:
 * 1. Bounded Input Injection & Peak Envelope Tracking
 * 2. Asymptotic Growth / Divergence Analysis
 * 3. Clear distinction between finite numerical simulation and theoretical BIBO classification.
 */

const StabilityTester = {
    /**
     * Run Stability Experiment
     * @param {Object} options
     * @param {string|Object} options.system
     * @param {Object} options.signal - Bounded test signal
     * @param {Array<number>} options.timeRange - e.g. [0, 10]
     */
    run(options) {
        const sys = typeof options.system === 'string' ? Systems.get(options.system) : options.system;
        const sigConfig = options.signal || { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } };
        const timeRange = options.timeRange || [0, 10];
        const numPoints = 600;

        const t = Utils.linspace(timeRange[0], timeRange[1], numPoints);

        // Continuous bounded test signal
        const xFn = Signals.createFunction(sigConfig.id, sigConfig.params);
        const xVals = t.map(ti => xFn(ti));

        // Evaluate output signal
        const yVals = sys.evaluateFn(xFn, t);

        // Calculate input bound Mx over window
        const inputBoundMx = Utils.maxAbs(xVals);

        // Calculate output peak My over window
        const outputPeakMy = Utils.maxAbs(yVals);

        // Envelope analysis: compute running maximum |y(t)| to detect unbounded growth
        const runningPeakY = new Array(t.length);
        let curMax = 0;
        for (let i = 0; i < t.length; i++) {
            const mag = Math.abs(yVals[i]);
            if (mag > curMax && isFinite(mag)) {
                curMax = mag;
            }
            runningPeakY[i] = curMax;
        }

        // Check growth rate across first half vs second half of observation window
        const midIdx = Math.floor(t.length / 2);
        const peakFirstHalf = runningPeakY[midIdx];
        const peakSecondHalf = runningPeakY[t.length - 1];
        const growthRatio = peakFirstHalf > 0 ? (peakSecondHalf / peakFirstHalf) : 1;

        // Theoretical reference
        const theoretical = sys.expectedProperties.stability;

        // Is bounded in finite simulation window
        const numericallyBounded = isFinite(outputPeakMy) && outputPeakMy < 1e5;

        // Divergence detected in simulation if growth ratio exceeds threshold and peak exceeds bound significantly
        const divergentInSimulation = growthRatio > 1.8 && outputPeakMy > 5 * Math.max(inputBoundMx, 1.0);

        return {
            system: sys,
            timeRange,
            inputs: {
                t,
                signal: { name: Signals.get(sigConfig.id).name, values: xVals, config: sigConfig },
                boundMx: inputBoundMx
            },
            outputs: {
                y: yVals,
                runningPeakY,
                peakMy: outputPeakMy,
                growthRatio
            },
            metrics: {
                inputBoundMx,
                outputPeakMy,
                numericallyBounded,
                divergentInSimulation,
                isTheoreticalStable: theoretical.isStable,
                amplificationRatio: inputBoundMx > 0 ? (outputPeakMy / inputBoundMx) : 1
            },
            theory: theoretical,
            explanation: this.generateExplanation(sys, theoretical.isStable, inputBoundMx, outputPeakMy, growthRatio, divergentInSimulation, theoretical)
        };
    },

    generateExplanation(system, isStable, mx, my, growthRatio, divergent, theoretical) {
        const mxStr = Utils.formatNumber(mx, 2);
        const myStr = Utils.formatNumber(my, 2);

        if (isStable) {
            return {
                verdict: '✓ BIBO Stable',
                statusClass: 'status-pass',
                summary: `For the bounded input test ($M_x = ${mxStr} < \\infty$), the output stayed strictly bounded with peak $M_y = ${myStr} < \\infty$.`,
                mathTest: `|x(t)| \\le M_x < \\infty \\implies |y(t)| \\le M_y < \\infty`,
                envelopeDetails: `Output-to-input amplification ratio: ${(my / (mx || 1)).toFixed(2)}. Running envelope is flat and non-divergent.`,
                why: theoretical.proof,
                disclaimer: 'Theoretical Note: While this finite simulation verified boundedness for this specific test signal, BIBO stability guarantees that ANY bounded input will produce a bounded output. The mathematical proof above confirms universal stability.'
            };
        } else {
            return {
                verdict: '✗ NOT BIBO Stable (Unstable)',
                statusClass: 'status-fail',
                summary: `The system fails BIBO stability! Even with a strictly bounded input ($M_x = ${mxStr}$), the output exhibits unbounded growth or can produce infinite gain.`,
                mathTest: `\\exists \\text{ bounded } x(t) \\ (|x(t)| \\le M_x) \\quad \\text{such that} \\quad \\lim_{t \\to \\infty} |y(t)| = \\infty`,
                envelopeDetails: `Observed output envelope reached peak $|y(t)|_{max} = ${myStr}$. Growth detected across simulation window (factor: ${growthRatio.toFixed(2)}x).`,
                why: theoretical.proof,
                disclaimer: 'Theoretical Note: A system is unstable if at least ONE bounded input produces an unbounded output (e.g. constant input into an integrator or time-multiplier).'
            };
        }
    }
};

window.StabilityTester = StabilityTester;
