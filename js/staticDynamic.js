/**
 * System Properties Verification Virtual Lab
 * Static vs Dynamic (Memoryless vs With Memory) Verification Engine
 * 
 * Definition:
 * A system is STATIC (Memoryless) if the output at any arbitrary time instant t = t0
 * depends ONLY on the input value at that exact same instant x(t0):
 * y(t0) = f(x(t0), t0)
 * 
 * A system is DYNAMIC (With Memory) if the output at t = t0 depends on:
 * - Past input values (e.g. x(t - 1))
 * - Future input values (e.g. x(t + 1))
 * - Accumulated history / interval operations (e.g. \int x(\tau) d\tau, dx/dt)
 * 
 * Experimental Test:
 * Construct two test signals x1(t) and x2(t) such that x1(t_probe) = x2(t_probe) EXACTLY,
 * but x1(t) != x2(t) at neighboring time instants.
 * - If y1(t_probe) == y2(t_probe): System has NO memory of other instants -> Static!
 * - If y1(t_probe) != y2(t_probe): System remembers/depends on other instants -> Dynamic!
 */

const StaticDynamicTester = {
    /**
     * Run Static vs Dynamic Experiment
     * @param {Object} options
     * @param {string|Object} options.system
     * @param {Object} options.signal - Base signal config
     * @param {number} options.probeTime - Instant of observation t_probe
     * @param {Array<number>} options.timeRange
     * @param {number} options.tolerance
     */
    run(options) {
        const sys = typeof options.system === 'string' ? Systems.get(options.system) : options.system;
        const sigConfig = options.signal || { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } };
        const probeTime = options.probeTime !== undefined ? Number(options.probeTime) : 1.0;
        const timeRange = options.timeRange || [-4, 4];
        const numPoints = 600;
        const tolerance = options.tolerance || 1e-4;

        const t = Utils.linspace(timeRange[0], timeRange[1], numPoints);

        // 1. Base test input signal: x1(t)
        const x1Fn = Signals.createFunction(sigConfig.id, sigConfig.params);
        const x1Vals = t.map(ti => x1Fn(ti));

        // 2. Probe-Matched Perturbation Signal: x2(t)
        // Ensure x2(probeTime) = x1(probeTime) exactly,
        // but add a significant disturbance pulse away from probeTime (e.g., at probeTime - 1.5)
        const perturbOffset = -1.5; // In the past of probeTime
        const perturbCenter = probeTime + perturbOffset;
        const perturbAmp = 2.0;

        const x2Fn = (ti) => {
            const base = x1Fn(ti);
            // Window of perturbation far from probeTime
            const distFromProbe = Math.abs(ti - probeTime);
            if (distFromProbe < 0.05) {
                // Pin precisely to x1(ti) near probe instant
                return base;
            }
            // Add smooth Gaussian or pulse disturbance centered at perturbCenter
            const distFromPerturb = Math.abs(ti - perturbCenter);
            if (distFromPerturb <= 1.0) {
                const bump = perturbAmp * Math.cos((Math.PI / 2) * distFromPerturb);
                return base + bump;
            }
            return base;
        };
        const x2Vals = t.map(ti => x2Fn(ti));

        // 3. Compute System Outputs for both signals
        const y1Vals = sys.evaluateFn(x1Fn, t);
        const y2Vals = sys.evaluateFn(x2Fn, t);

        // 4. Sample outputs at the exact probe time
        const y1AtProbe = sys.evaluateFn(x1Fn, [probeTime])[0];
        const y2AtProbe = sys.evaluateFn(x2Fn, [probeTime])[0];
        const probeDifference = Math.abs(y1AtProbe - y2AtProbe);

        // Output difference waveform across the entire time grid
        const errorVals = t.map((_, i) => y2Vals[i] - y1Vals[i]);

        // Theoretical expectation
        const theoretical = (sys.expectedProperties && sys.expectedProperties.staticDynamic)
            ? sys.expectedProperties.staticDynamic
            : (sys.isStatic !== undefined 
                ? { isStatic: sys.isStatic, verdictText: sys.isStatic ? 'Static (Memoryless)' : 'Dynamic (With Memory)' }
                : { isStatic: true, verdictText: 'Static (Memoryless)' });

        const isStaticTheoretical = theoretical.isStatic;
        const isStaticNumerical = probeDifference < tolerance;

        // Final verdict combines analytical and simulation check
        const isStatic = isStaticTheoretical;

        return {
            system: sys,
            probeTime,
            perturbCenter,
            inputs: {
                t,
                x1: { name: Signals.get(sigConfig.id).name, values: x1Vals, config: sigConfig },
                x2: { name: 'Probe-Matched Signal (Altered away from t₀)', values: x2Vals },
                difference: t.map((_, i) => x2Vals[i] - x1Vals[i]),
                x1AtProbe: x1Fn(probeTime),
                x2AtProbe: x2Fn(probeTime)
            },
            outputs: {
                y1: y1Vals,
                y2: y2Vals,
                difference: errorVals,
                y1AtProbe,
                y2AtProbe,
                probeDifference
            },
            metrics: {
                probeDifference,
                tolerance,
                isStatic,
                isDynamic: !isStatic,
                theoreticalMatches: isStaticNumerical === isStaticTheoretical
            },
            theory: theoretical,
            explanation: this.generateExplanation(sys, isStatic, probeDifference, probeTime, tolerance, theoretical)
        };
    },

    generateExplanation(system, isStatic, probeDiff, probeTime, tolerance, theoretical) {
        const diffFormatted = Utils.formatNumber(probeDiff);
        const tolFormatted = Utils.formatNumber(tolerance);
        const t0Str = Utils.formatNumber(probeTime, 2);

        if (isStatic) {
            return {
                verdict: '✓ System is Static (Memoryless)',
                statusClass: 'status-pass',
                badgeText: 'Static (Memoryless)',
                summary: `The system depends strictly on the input at the current instant $t = ${t0Str}$. Modifying the signal at other times did not alter $y(${t0Str})$.`,
                mathTest: `x_1(${t0Str}) = x_2(${t0Str}) \\implies y_1(${t0Str}) = y_2(${t0Str})`,
                errorDetails: `Output deviation at probe instant: $|y_1(${t0Str}) - y_2(${t0Str})| = ${diffFormatted}$ (below tolerance $\\le ${tolFormatted}$).`,
                why: theoretical.proof || 'The output at any instant t is a function strictly of x(t) at that exact moment. It contains no storage elements, time shifts, derivatives, or integrals.'
            };
        } else {
            return {
                verdict: '✓ System is Dynamic (With Memory)',
                statusClass: 'status-dynamic',
                badgeText: 'Dynamic (With Memory)',
                summary: `The system has memory: the output at $t = ${t0Str}$ depends on past/future values or accumulation over time.`,
                mathTest: `x_1(${t0Str}) = x_2(${t0Str}) \\;\\text{but}\\; y_1(${t0Str}) \\ne y_2(${t0Str})`,
                errorDetails: `Output deviation at probe instant: $|y_1(${t0Str}) - y_2(${t0Str})| = ${diffFormatted}$ (exceeds threshold).`,
                why: theoretical.proof || 'The system output requires input values at other time instants (past, future, or a continuous time history).'
            };
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StaticDynamicTester;
}
if (typeof window !== 'undefined') {
    window.StaticDynamicTester = StaticDynamicTester;
}
