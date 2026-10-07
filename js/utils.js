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
    }
};

window.Utils = Utils;
