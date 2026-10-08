/**
 * System Properties Verification Virtual Lab
 * Causality Verification Engine:
 * Output y(t) at present time t depends solely on present and past inputs (tau <= t), NEVER future inputs (tau > t).
 * Features:
 * 1. Timeline Probe analysis: maps sample dependency at t_probe
 * 2. Future Perturbation Experiment: injects disturbance strictly for tau > t_probe and tests if y(t_probe) changes.
 */

const CausalityTester = {
    /**
     * Run Causality Experiment
     * @param {Object} options
     * @param {string|Object} options.system
     * @param {Object} options.signal - Base signal config
     * @param {number} options.probeTime - Present observation instant t_probe (e.g. 0.0)
     * @param {Array<number>} options.timeRange
     */
    run(options) {
        const sys = typeof options.system === 'string' ? Systems.get(options.system) : options.system;
        const sigConfig = options.signal || { id: 'step', params: { amplitude: 1, shift: 0 } };
        const probeTime = options.probeTime !== undefined ? Number(options.probeTime) : 0.0;
        const timeRange = options.timeRange || [-5, 5];
        const numPoints = 600;

        const t = Utils.linspace(timeRange[0], timeRange[1], numPoints);

        // 1. Base Signal
        const baseFn = Signals.createFunction(sigConfig.id, sigConfig.params);
        const baseVals = t.map(ti => baseFn(ti));

        // 2. Future Perturbation Signal
        // Injects a localized pulse strictly in the FUTURE of probeTime: t_perturb = probeTime + 2.0
        const perturbCenter = probeTime + 2.0;
        const perturbWidth = 1.0;
        const perturbAmp = 2.0;

        const pertFn = (ti) => {
            const baseVal = baseFn(ti);
            // Disturbance only exists for strictly ti > probeTime
            if (ti > probeTime && Math.abs(ti - perturbCenter) <= perturbWidth / 2) {
                return baseVal + perturbAmp;
            }
            return baseVal;
        };
        const pertVals = t.map(ti => pertFn(ti));

        // Evaluate system response for both baseline and perturbed inputs
        const yBaseVals = sys.evaluateFn(baseFn, t);
        const yPertVals = sys.evaluateFn(pertFn, t);

        // Output difference: y_pert(t) - y_base(t)
        const diffVals = t.map((_, i) => yPertVals[i] - yBaseVals[i]);

        // Evaluate probe outputs at exact probeTime
        const yBaseAtProbe = sys.evaluateFn(baseFn, [probeTime])[0];
        const yPertAtProbe = sys.evaluateFn(pertFn, [probeTime])[0];
        const probeDiff = Math.abs(yPertAtProbe - yBaseAtProbe);

        // Check if ANY disturbance leaked into the present or past (t <= probeTime)
        let pastLeakageMax = 0;
        for (let i = 0; i < t.length; i++) {
            if (t[i] <= probeTime + 1e-4) {
                const leak = Math.abs(diffVals[i]);
                if (leak > pastLeakageMax) {
                    pastLeakageMax = leak;
                }
            }
        }

        // Theoretical expectation
        const theoretical = sys.expectedProperties.causality;
        const probeOffset = theoretical.probeOffset || 0;
        const requiredTime = probeTime + probeOffset;
        const requiresFuture = probeOffset > 0;
        const isCausal = !requiresFuture && (pastLeakageMax < 1e-4);

        return {
            system: sys,
            probeTime,
            perturbCenter,
            requiredTime,
            requiresFuture,
            inputs: {
                t,
                base: { name: Signals.get(sigConfig.id).name, values: baseVals },
                perturbed: { name: 'Perturbed Input (Future disturbance)', values: pertVals },
                perturbationOnly: t.map((_, i) => pertVals[i] - baseVals[i])
            },
            outputs: {
                base: yBaseVals,
                perturbed: yPertVals,
                difference: diffVals,
                yBaseAtProbe,
                yPertAtProbe,
                probeDiff
            },
            metrics: {
                pastLeakageMax,
                isCausal,
                theoreticalMatches: isCausal === theoretical.isCausal
            },
            theory: theoretical,
            explanation: this.generateExplanation(sys, isCausal, probeTime, requiredTime, probeOffset, probeDiff, theoretical)
        };
    },

    generateExplanation(system, isCausal, probeTime, requiredTime, probeOffset, probeDiff, theoretical) {
        if (isCausal) {
            let dependencyDesc = '';
            if (probeOffset < 0) {
                dependencyDesc = `At present time $t = ${probeTime}$, output requires input at $t = ${requiredTime}$ (past time, $\\tau < t$).`;
            } else {
                dependencyDesc = `At present time $t = ${probeTime}$, output requires input at $t = ${requiredTime}$ (current present time, $\\tau = t$).`;
            }

            return {
                verdict: '✓ System is Causal',
                statusClass: 'status-pass',
                summary: `The system depends only on present and past input values. Adding a perturbation strictly in the future ($t > ${probeTime}$) caused ZERO change to present or past output.`,
                mathTest: `y(${probeTime}) = T\\{x(\\tau)\\big|_{\\tau \\le ${probeTime}}\\}`,
                dependencyDetails: dependencyDesc,
                why: theoretical.proof
            };
        } else {
            return {
                verdict: '✗ System is Non-Causal (Anticipatory)',
                statusClass: 'status-fail',
                summary: `The system anticipates future inputs! At present time $t = ${probeTime}$, the output requires input from future instant $t = ${requiredTime}$ ($t + ${probeOffset} > t$).`,
                mathTest: `y(${probeTime}) \\text{ depends on } x(${requiredTime}) \\quad (\\tau = ${requiredTime} > ${probeTime})`,
                dependencyDetails: `When a disturbance was injected into future time, the output at present time changed prematurely by $\\Delta y = ${Utils.formatNumber(probeDiff)}$!`,
                why: theoretical.proof
            };
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CausalityTester;
}
if (typeof window !== 'undefined') {
    window.CausalityTester = CausalityTester;
}
