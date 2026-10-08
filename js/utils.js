/**
 * System Properties Verification Virtual Lab
 * Utility functions for numerical computation, array operations, and math formatting
 */

const Utils = {
    // Default numerical tolerance for floating-point difference comparisons
    DEFAULT_TOLERANCE: 1e-4,

    /**
     * Generate an array of n linearly spaced points between start and end inclusive
     */
    linspace(start, end, numPoints = 500) {
        const arr = new Float64Array(numPoints);
        const step = (end - start) / (numPoints - 1);
        for (let i = 0; i < numPoints; i++) {
            arr[i] = start + i * step;
        }
        return Array.from(arr);
    },

    /**
     * Scalar multiplication of an array
     */
    scale(arr, scalar) {
        return arr.map(v => v * scalar);
    },

    /**
     * Element-wise addition of two arrays
     */
    add(arr1, arr2) {
        const n = Math.min(arr1.length, arr2.length);
        const res = new Array(n);
        for (let i = 0; i < n; i++) {
            res[i] = arr1[i] + arr2[i];
        }
        return res;
    },

    /**
     * Element-wise subtraction (arr1 - arr2)
     */
    subtract(arr1, arr2) {
        const n = Math.min(arr1.length, arr2.length);
        const res = new Array(n);
        for (let i = 0; i < n; i++) {
            res[i] = arr1[i] - arr2[i];
        }
        return res;
    },

    /**
     * Maximum absolute value of an array
     */
    maxAbs(arr) {
        let max = 0;
        for (let i = 0; i < arr.length; i++) {
            const abs = Math.abs(arr[i]);
            if (abs > max && !isNaN(abs) && isFinite(abs)) {
                max = abs;
            }
        }
        return max;
    },

    /**
     * Maximum absolute difference between two arrays
     */
    maxAbsDiff(arr1, arr2) {
        const n = Math.min(arr1.length, arr2.length);
        let maxDiff = 0;
        for (let i = 0; i < n; i++) {
            const v1 = arr1[i];
            const v2 = arr2[i];
            if (isFinite(v1) && isFinite(v2)) {
                const diff = Math.abs(v1 - v2);
                if (diff > maxDiff) {
                    maxDiff = diff;
                }
            }
        }
        return maxDiff;
    },

    /**
     * Numerical derivative using central differences for interior points,
     * forward/backward difference at endpoints
     */
    numericalDerivative(y, t) {
        const n = y.length;
        const dy = new Array(n);
        if (n < 2) return y.map(() => 0);

        const dt0 = t[1] - t[0];
        dy[0] = (y[1] - y[0]) / dt0;

        for (let i = 1; i < n - 1; i++) {
            const dt = t[i + 1] - t[i - 1];
            dy[i] = (y[i + 1] - y[i - 1]) / dt;
        }

        const dtEnd = t[n - 1] - t[n - 2];
        dy[n - 1] = (y[n - 1] - y[n - 2]) / dtEnd;

        return dy;
    },

    /**
     * Cumulative numerical integral (trapezoidal rule)
     * y_int(t) = \int_{t0}^t y(\tau) d\tau
     */
    cumulativeIntegral(y, t, initialCondition = 0) {
        const n = y.length;
        const res = new Array(n);
        res[0] = initialCondition;
        for (let i = 1; i < n; i++) {
            const dt = t[i] - t[i - 1];
            res[i] = res[i - 1] + 0.5 * (y[i] + y[i - 1]) * dt;
        }
        return res;
    },

    /**
     * Evaluate a continuous function at points, or interpolate if an array is given
     */
    interpolate(tQuery, tGrid, yGrid, extrapolation = 0) {
        const n = tGrid.length;
        if (tQuery < tGrid[0] || tQuery > tGrid[n - 1]) {
            return extrapolation;
        }
        // Binary search for interval
        let low = 0, high = n - 1;
        while (high - low > 1) {
            const mid = (low + high) >> 1;
            if (tGrid[mid] <= tQuery) {
                low = mid;
            } else {
                high = mid;
            }
        }
        const t0 = tGrid[low], t1 = tGrid[high];
        const y0 = yGrid[low], y1 = yGrid[high];
        if (t1 === t0) return y0;
        const fraction = (tQuery - t0) / (t1 - t0);
        return y0 + fraction * (y1 - y0);
    },

    /**
     * Shift signal in time: returns y(t - t0)
     * Evaluates signal generating function at (t - t0)
     */
    shiftSignalFn(signalFn, tArray, t0) {
        return tArray.map(t => signalFn(t - t0));
    },

    /**
     * Format a floating-point number nicely for display
     */
    formatNumber(num, decimals = 4) {
        if (num === null || num === undefined || isNaN(num)) return 'N/A';
        if (!isFinite(num)) return num > 0 ? '+Infinity' : '-Infinity';
        if (Math.abs(num) < 1e-12) return '0';
        if (Math.abs(num) < 1e-3 || Math.abs(num) >= 1e4) {
            return num.toExponential(3);
        }
        return num.toFixed(decimals);
    },

    /**
     * Render KaTeX into a DOM element
     */
    renderKaTeX(elementOrId, latexString, displayMode = false) {
        const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
        if (!el) return;
        if (window.katex) {
            try {
                window.katex.render(latexString, el, {
                    throwOnError: false,
                    displayMode: displayMode
                });
            } catch (err) {
                console.warn('KaTeX render error:', err);
                el.textContent = latexString;
            }
        } else {
            el.textContent = latexString;
        }
    },

    /**
     * Trigger auto-render across all elements with math delimiters
     */
    renderAllMath(container = document.body) {
        if (window.renderMathInElement) {
            try {
                window.renderMathInElement(container, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '\\(', right: '\\)', display: false }
                    ],
                    throwOnError: false
                });
            } catch (err) {
                console.warn('Auto-render error:', err);
            }
        } else {
            // If KaTeX CDN is still downloading, retry shortly
            setTimeout(() => {
                if (window.renderMathInElement) {
                    try {
                        window.renderMathInElement(container, {
                            delimiters: [
                                { left: '$$', right: '$$', display: true },
                                { left: '$', right: '$', display: false },
                                { left: '\\[', right: '\\]', display: true },
                                { left: '\\(', right: '\\)', display: false }
                            ],
                            throwOnError: false
                        });
                    } catch (e) {}
                }
            }, 500);
        }
    },

    /**
     * Clamp a number between min and max
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    /**
     * Compile a custom mathematical signal expression f(t)
     */
    compileMathExpr(rawExpr) {
        if (!rawExpr || typeof rawExpr !== 'string') {
            return { success: false, error: 'Expression must be a non-empty string.' };
        }

        let expr = rawExpr.trim();
        // Remove leading prefixes like x(t) = or y(t) =
        expr = expr.replace(/^(x\(t\)|y\(t\)|f\(t\))\s*=\s*/i, '');

        // Convert e^(...) or e^(-at) to exp(...)
        expr = expr.replace(/\be\s*\^\s*\(([^)]+)\)/gi, 'exp($1)');
        expr = expr.replace(/\be\s*\^\s*([a-zA-Z0-9_\.\-]+)/gi, 'exp($1)');

        // Convert constants
        expr = expr.replace(/\bpi\b/gi, 'Math.PI');
        expr = expr.replace(/\be\b(?!\w)/gi, 'Math.E');

        // Signals & Systems canonical functions
        expr = expr.replace(/\bu\s*\(([^)]+)\)/gi, '((($1) >= 0) ? 1 : 0)');
        expr = expr.replace(/\br\s*\(([^)]+)\)/gi, '((($1) >= 0) ? ($1) : 0)');
        expr = expr.replace(/\brect\s*\(([^)]+)\)/gi, '(Math.abs($1) <= 0.5 ? 1 : 0)');
        expr = expr.replace(/\bsinc\s*\(([^)]+)\)/gi, '((($1) === 0) ? 1 : (Math.sin(Math.PI * ($1)) / (Math.PI * ($1))))');

        // Standard Math functions
        const mathFuncs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'log', 'log10', 'sqrt', 'abs', 'floor', 'ceil', 'round', 'sign'];
        mathFuncs.forEach(fn => {
            const regex = new RegExp(`(?<!Math\\.)\\b${fn}\\b`, 'gi');
            expr = expr.replace(regex, `Math.${fn}`);
        });

        // Power operator
        expr = expr.replace(/\^/g, '**');

        // Implicit multiplication
        expr = expr.replace(/(\d)(\s*)([a-zA-Z\(])/g, '$1*$3');
        expr = expr.replace(/(\))(\s*)([a-zA-Z\d\(])/g, '$1*$3');
        expr = expr.replace(/(\bt\b)(\s*)([a-zA-Z\(])/g, '$1*$3');

        try {
            const fn = new Function('t', `
                try {
                    const val = Number(${expr});
                    return isFinite(val) ? val : 0;
                } catch(e) {
                    return 0;
                }
            `);
            fn(0);
            fn(1);
            return { success: true, fn, cleanedExpr: expr };
        } catch (err) {
            return { success: false, error: err.message, cleanedExpr: expr };
        }
    },

    /**
     * Compile a custom system equation T{x(t)}
     */
    compileSystemExpr(rawExpr) {
        if (!rawExpr || typeof rawExpr !== 'string') {
            return { success: false, error: 'System expression must be a non-empty string.' };
        }

        let expr = rawExpr.trim();
        expr = expr.replace(/^y\(t\)\s*=\s*/i, '');

        const isDiff = /\b(diff|d\/dt|dx\/dt)\b/i.test(expr) || /\\frac\{dx\}\{dt\}/i.test(expr);
        const isIntegral = /\b(int|integral)\b/i.test(expr) || /\\int/i.test(expr);

        if (isDiff) {
            return {
                success: true,
                id: 'custom_diff',
                name: 'Custom Differentiator',
                latex: 'y(t) = \\frac{dx(t)}{dt}',
                shortFormula: 'dx/dt',
                description: 'Custom differential operator computed via high-precision numerical derivative.',
                evaluateFn: (xFn, tArray) => {
                    const dt = 1e-4;
                    return tArray.map(t => (xFn(t) - xFn(t - dt)) / dt);
                },
                evaluateArray: (xValues, tArray) => Utils.numericalDerivative(xValues, tArray),
                expectedProperties: {
                    linearity: { isLinear: true, verdictText: 'Linear', proof: 'Differentiation is a linear operator: d/dt[a*x1 + b*x2] = a*x1\' + b*x2\'.' },
                    timeInvariance: { isTimeInvariant: true, verdictText: 'Time Invariant', proof: 'Differentiation has constant coefficients independent of time origin.' },
                    causality: { isCausal: true, verdictText: 'Causal (Backward Limit)', probeOffset: 0, proof: 'Computed using backward differences at t and immediately preceding past instants.' },
                    stability: { isStable: false, verdictText: 'Not BIBO Stable', proof: 'High frequency or discontinuous bounded inputs produce unbounded derivatives.' },
                    staticDynamic: { isStatic: false, verdictText: 'Dynamic (With Memory)', proof: 'Rate of change requires knowledge of values over an infinitesimal time neighborhood.' }
                }
            };
        }

        if (isIntegral) {
            return {
                success: true,
                id: 'custom_integral',
                name: 'Custom Integrator',
                latex: 'y(t) = \\int_{-\\infty}^t x(\\tau)d\\tau',
                shortFormula: '\\int_{-\\infty}^t x(\\tau)d\\tau',
                description: 'Custom cumulative integral operator running up to current time t.',
                evaluateFn: (xFn, tArray) => {
                    const xVals = tArray.map(t => xFn(t));
                    return Utils.cumulativeIntegral(xVals, tArray, 0);
                },
                evaluateArray: (xValues, tArray) => Utils.cumulativeIntegral(xValues, tArray, 0),
                expectedProperties: {
                    linearity: { isLinear: true, verdictText: 'Linear', proof: 'Integration is a linear integral operator satisfying superposition.' },
                    timeInvariance: { isTimeInvariant: true, verdictText: 'Time Invariant', proof: 'Integrating shifted inputs yields delayed outputs.' },
                    causality: { isCausal: true, verdictText: 'Causal', probeOffset: 0, proof: 'Integration runs up to present upper bound t, never into the future.' },
                    stability: { isStable: false, verdictText: 'Not BIBO Stable', proof: 'Bounded DC step inputs produce unbounded ramps diverging to infinity.' },
                    staticDynamic: { isStatic: false, verdictText: 'Dynamic (With Memory)', proof: 'Accumulates past energy over the entire previous time history.' }
                }
            };
        }

        let timeTransformFn = (t) => t;
        let hasTimeShift = false;
        let shiftAmount = 0;
        let hasTimeScale = false;
        let scaleAmount = 1;

        const xArgMatch = expr.match(/x\s*\(\s*([^)]+)\s*\)/i);
        if (xArgMatch) {
            const arg = xArgMatch[1].trim();
            if (arg !== 't') {
                const shiftMatch = arg.match(/^t\s*([+-])\s*([0-9\.]+)/);
                if (shiftMatch) {
                    hasTimeShift = true;
                    const sign = shiftMatch[1] === '-' ? -1 : 1;
                    shiftAmount = sign * parseFloat(shiftMatch[2]);
                    timeTransformFn = (t) => t + shiftAmount;
                } else if (/^-\s*t$/.test(arg)) {
                    hasTimeScale = true;
                    scaleAmount = -1;
                    timeTransformFn = (t) => -t;
                } else {
                    const scaleMatch = arg.match(/^([0-9\.\-]+)\s*\*?\s*t$/);
                    if (scaleMatch) {
                        hasTimeScale = true;
                        scaleAmount = parseFloat(scaleMatch[1]);
                        timeTransformFn = (t) => scaleAmount * t;
                    }
                }
            }
        }

        let evalCode = expr.replace(/x\s*\(\s*[^)]+\s*\)/gi, 'xVal(t)');
        evalCode = evalCode.replace(/\be\s*\^\s*\(([^)]+)\)/gi, 'exp($1)');
        evalCode = evalCode.replace(/\be\s*\^\s*([a-zA-Z0-9_\.\-]+)/gi, 'exp($1)');
        evalCode = evalCode.replace(/\bpi\b/gi, 'Math.PI');
        evalCode = evalCode.replace(/\be\b(?!\w)/gi, 'Math.E');

        const mathFuncs = ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs', 'round', 'floor', 'ceil', 'sign'];
        mathFuncs.forEach(fn => {
            const regex = new RegExp(`(?<!Math\\.)\\b${fn}\\b`, 'gi');
            evalCode = evalCode.replace(regex, `Math.${fn}`);
        });

        evalCode = evalCode.replace(/\^/g, '**');
        evalCode = evalCode.replace(/(\d)(\s*)([a-zA-Z\(])/g, '$1*$3');
        evalCode = evalCode.replace(/(\))(\s*)([a-zA-Z\d\(])/g, '$1*$3');
        evalCode = evalCode.replace(/(\bt\b)(\s*)([a-zA-Z\(])/g, '$1*$3');

        try {
            const rowFn = new Function('t', 'xVal', `
                try {
                    const val = Number(${evalCode});
                    return isFinite(val) ? val : 0;
                } catch(e) {
                    return 0;
                }
            `);
            rowFn(1, () => 2);

            const evaluateFn = (xFn, tArray) => {
                return tArray.map(t => {
                    return rowFn(t, (time) => xFn(timeTransformFn(time)));
                });
            };

            const evaluateArray = (xValues, tArray) => {
                const interpFn = (tau) => Utils.interpolate(tau, tArray, xValues, 0);
                return evaluateFn(interpFn, tArray);
            };

            const analysis = this.analyzeSystemProperties(rawExpr, evalCode, hasTimeShift, shiftAmount, hasTimeScale, scaleAmount);

            return {
                success: true,
                id: 'custom_user_system',
                name: 'Custom Defined System',
                latex: `y(t) = ${rawExpr.replace(/\*/g, ' \\cdot ')}`,
                shortFormula: rawExpr,
                description: `Custom user-defined mathematical system: y(t) = ${rawExpr}.`,
                evaluateFn,
                evaluateArray,
                expectedProperties: analysis.expectedProperties
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    /**
     * Analytical Property Analyzer for Custom Equations
     */
    analyzeSystemProperties(rawExpr, evalCode, hasShift, shiftAmt, hasScale, scaleAmt) {
        const exprLower = rawExpr.toLowerCase();

        let isLinear = true;
        let linearityProof = 'Satisfies superposition principle T{a*x1 + b*x2} = a*T{x1} + b*T{x2}.';
        if (/\^|\*\*|abs|exp|sin|cos|log|sqrt/.test(exprLower)) {
            isLinear = false;
            linearityProof = 'Fails superposition: involves non-linear operators or powers of x(t). Expanding T{a*x1 + b*x2} produces cross terms.';
        }
        if (/\+\s*[0-9\.]+|-\s*[0-9\.]+/.test(exprLower) && !/x\s*\(\s*t\s*([+-])/.test(exprLower)) {
            isLinear = false;
            linearityProof = 'Fails homogeneity: constant non-zero offset causes T{0} ≠ 0.';
        }

        let isTimeInvariant = true;
        let tiProof = 'No explicit time dependency in coefficients. Shifting the input delays the output identically.';
        const outsideT = rawExpr.replace(/x\s*\([^)]*\)/g, '');
        if (/\bt\b/.test(outsideT) || (hasScale && scaleAmt !== 1)) {
            isTimeInvariant = false;
            tiProof = (hasScale && scaleAmt !== 1)
                ? `Time scaling x(${scaleAmt}t) produces time-dependent compression: T{x(t - t₀)} ≠ y(t - t₀).`
                : 'Explicit time variable t appears in system coefficients, causing time-varying behavior.';
        }

        let isCausal = true;
        let causalityProof = 'Output at present time t depends solely on present or past inputs (τ ≤ t).';
        let probeOffset = 0;
        if (hasShift && shiftAmt > 0) {
            isCausal = false;
            probeOffset = shiftAmt;
            causalityProof = `Output at time t requires future input x(t + ${shiftAmt}), which is anticipative.`;
        } else if (hasScale && (scaleAmt > 1 || scaleAmt < 0)) {
            isCausal = false;
            probeOffset = 1;
            causalityProof = 'Time scaling/reversal samples future time instants (e.g. for t > 0 when scale > 1, or for t < 0 when reversed).';
        }

        let isStable = true;
        let stabilityProof = 'Every bounded input (|x(t)| ≤ Mx < ∞) produces a bounded output (|y(t)| ≤ My < ∞).';
        if (/\bt\b/.test(outsideT)) {
            isStable = false;
            stabilityProof = 'Time factor t grows unboundedly as t → ∞, causing bounded inputs to diverge.';
        }

        let isStatic = true;
        let staticProof = 'Memoryless: output at any instant t depends solely on the input value at that exact same instant t.';
        if (hasShift || (hasScale && scaleAmt !== 1)) {
            isStatic = false;
            staticProof = hasShift
                ? (shiftAmt < 0 
                    ? `Dynamic (With Memory): output at t depends on past input x(t - ${Math.abs(shiftAmt)}).`
                    : `Dynamic (With Memory): output at t depends on future input x(t + ${shiftAmt}).`)
                : 'Dynamic (With Memory): time scaling samples inputs at time instants different from current t.';
        }

        return {
            expectedProperties: {
                linearity: {
                    isLinear,
                    verdictText: isLinear ? 'Linear' : 'Non-linear',
                    proof: linearityProof
                },
                timeInvariance: {
                    isTimeInvariant,
                    verdictText: isTimeInvariant ? 'Time Invariant' : 'Time Varying',
                    proof: tiProof
                },
                causality: {
                    isCausal,
                    verdictText: isCausal ? 'Causal' : 'Non-Causal',
                    probeOffset,
                    proof: causalityProof
                },
                stability: {
                    isStable,
                    verdictText: isStable ? 'BIBO Stable' : 'Not BIBO Stable',
                    proof: stabilityProof
                },
                staticDynamic: {
                    isStatic,
                    verdictText: isStatic ? 'Static (Memoryless)' : 'Dynamic (With Memory)',
                    proof: staticProof
                }
            }
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

