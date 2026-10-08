/**
 * System Properties Verification Virtual Lab
 * Minimalist Plotly Plot Rendering Engine
 * Clean Light / White Theme
 * Optimized for high-performance 60 FPS live oscilloscope animation
 */

const Plots = {
    theme: {
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#ffffff',
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#64748b',
            size: 10
        },
        marginScope: { l: 40, r: 15, t: 15, b: 28 },
        marginProp: { l: 36, r: 12, t: 8, b: 24 },
        gridcolor: '#e2e8f0',
        zerolinecolor: '#cbd5e1',
        colors: {
            cyan: '#0284c7',      // Deep crisp sky blue (high contrast)
            amber: '#d97706',     // Warm amber
            green: '#16a34a',     // Emerald green
            gold: '#b45309',      // Dark gold
            violet: '#7c3aed',    // Vibrant violet
            red: '#dc2626'        // Crimson red
        }
    },

    plotlyConfig: {
        responsive: true,
        displayModeBar: false
    },

    getBaseLayout(margin, yRange) {
        const layout = {
            paper_bgcolor: this.theme.paper_bgcolor,
            plot_bgcolor: this.theme.plot_bgcolor,
            font: this.theme.font,
            margin: margin || this.theme.marginProp,
            showlegend: false,
            xaxis: {
                showgrid: true,
                gridcolor: this.theme.gridcolor,
                zeroline: true,
                zerolinecolor: this.theme.zerolinecolor,
                tickfont: { size: 9, color: '#64748b' }
            },
            yaxis: {
                showgrid: true,
                gridcolor: this.theme.gridcolor,
                zeroline: true,
                zerolinecolor: this.theme.zerolinecolor,
                tickfont: { size: 9, color: '#64748b' }
            },
            hovermode: false
        };

        if (yRange) {
            layout.yaxis.range = yRange;
            layout.yaxis.autorange = false;
        }

        return layout;
    },

    /**
     * Initial Setup for Main Scope: Input Signal x(t)
     */
    initScopeInput(containerId, t, xVals, yMax = 3.5) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;

        const trace = {
            x: t,
            y: xVals,
            mode: 'lines',
            name: 'x(t)',
            line: { color: this.theme.colors.cyan, width: 2.2 }
        };

        const layout = this.getBaseLayout(this.theme.marginScope, [-yMax, yMax]);
        Plotly.react(el, [trace], layout, this.plotlyConfig);
    },

    /**
     * Live Update for Main Scope
     */
    updateScopeInput(containerId, xVals) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;
        Plotly.restyle(el, { y: [xVals] }, [0]);
    },

    /**
     * Initial Setup for Section 1: Linearity Plot
     * Traces: 0: x(t) input, 1: 2x(t) linear scaled, 2: x^2(t) non-linear distorted
     */
    initPropLinearity(containerId, t, yInput, yLinear, yNonLinear, yMax = 7.0) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;

        const trace0 = {
            x: t,
            y: yInput,
            mode: 'lines',
            name: 'x(t)',
            line: { color: this.theme.colors.cyan, width: 1.8 }
        };
        const trace1 = {
            x: t,
            y: yLinear,
            mode: 'lines',
            name: '2x(t) [Linear]',
            line: { color: this.theme.colors.green, width: 2 }
        };
        const trace2 = {
            x: t,
            y: yNonLinear,
            mode: 'lines',
            name: 'x²(t) [Non-linear]',
            line: { color: this.theme.colors.amber, width: 1.6, dash: 'dash' }
        };

        const layout = this.getBaseLayout(this.theme.marginProp, [-yMax * 0.7, yMax]);
        layout.showlegend = true;
        layout.legend = {
            orientation: 'h',
            y: 1.25,
            x: 0,
            font: { size: 9, color: '#64748b' }
        };

        Plotly.react(el, [trace0, trace1, trace2], layout, this.plotlyConfig);
    },

    updatePropLinearity(containerId, yInput, yLinear, yNonLinear) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;
        Plotly.restyle(el, { y: [yInput, yLinear, yNonLinear] }, [0, 1, 2]);
    },

    /**
     * Initial Setup for Section 2: Causality Plot
     * Traces: 0: Present x(t), 1: Causal past x(t - td), 2: Non-causal future x(t + td)
     */
    initPropCausality(containerId, t, yPresent, yPast, yFuture, yMax = 3.5) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;

        const trace0 = {
            x: t,
            y: yPresent,
            mode: 'lines',
            name: 'x(t) [Present]',
            line: { color: this.theme.colors.cyan, width: 2 }
        };
        const trace1 = {
            x: t,
            y: yPast,
            mode: 'lines',
            name: 'x(t - 0.5) [Causal]',
            line: { color: this.theme.colors.green, width: 1.8 }
        };
        const trace2 = {
            x: t,
            y: yFuture,
            mode: 'lines',
            name: 'x(t + 0.5) [Non-causal]',
            line: { color: this.theme.colors.red, width: 1.6, dash: 'dot' }
        };

        const layout = this.getBaseLayout(this.theme.marginProp, [-yMax, yMax]);
        layout.showlegend = true;
        layout.legend = {
            orientation: 'h',
            y: 1.25,
            x: 0,
            font: { size: 9, color: '#64748b' }
        };

        Plotly.react(el, [trace0, trace1, trace2], layout, this.plotlyConfig);
    },

    updatePropCausality(containerId, yPresent, yPast, yFuture) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;
        Plotly.restyle(el, { y: [yPresent, yPast, yFuture] }, [0, 1, 2]);
    },

    /**
     * Initial Setup for Section 3: Time-Invariance Plot
     * Traces: 0: Original x(t), 1: Time-delayed x(t - 1.0)
     */
    initPropTimeInvariance(containerId, t, yOriginal, yShifted, yMax = 3.5) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;

        const trace0 = {
            x: t,
            y: yOriginal,
            mode: 'lines',
            name: 'x(t)',
            line: { color: this.theme.colors.cyan, width: 2 }
        };
        const trace1 = {
            x: t,
            y: yShifted,
            mode: 'lines',
            name: 'x(t - 1.0s) [Shifted]',
            line: { color: this.theme.colors.green, width: 2, dash: 'dash' }
        };

        const layout = this.getBaseLayout(this.theme.marginProp, [-yMax, yMax]);
        layout.showlegend = true;
        layout.legend = {
            orientation: 'h',
            y: 1.25,
            x: 0,
            font: { size: 9, color: '#64748b' }
        };

        Plotly.react(el, [trace0, trace1], layout, this.plotlyConfig);
    },

    updatePropTimeInvariance(containerId, yOriginal, yShifted) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;
        Plotly.restyle(el, { y: [yOriginal, yShifted] }, [0, 1]);
    },

    /**
     * Initial Setup for Section 4: Stability Plot
     * Traces: 0: Signal x(t), 1: +Bound line, 2: -Bound line
     */
    initPropStability(containerId, t, ySignal, boundVal, yMax = 4.0) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;

        const boundUpper = t.map(() => boundVal);
        const boundLower = t.map(() => -boundVal);

        const trace0 = {
            x: t,
            y: ySignal,
            mode: 'lines',
            name: 'x(t)',
            line: { color: this.theme.colors.cyan, width: 2 }
        };
        const trace1 = {
            x: t,
            y: boundUpper,
            mode: 'lines',
            name: `+Bound (${boundVal.toFixed(1)}V)`,
            line: { color: this.theme.colors.gold, width: 1.5, dash: 'dash' }
        };
        const trace2 = {
            x: t,
            y: boundLower,
            mode: 'lines',
            name: `-Bound (-${boundVal.toFixed(1)}V)`,
            line: { color: this.theme.colors.gold, width: 1.5, dash: 'dash' }
        };

        const layout = this.getBaseLayout(this.theme.marginProp, [-yMax, yMax]);
        layout.showlegend = true;
        layout.legend = {
            orientation: 'h',
            y: 1.25,
            x: 0,
            font: { size: 9, color: '#64748b' }
        };

        Plotly.react(el, [trace0, trace1, trace2], layout, this.plotlyConfig);
    },

    updatePropStability(containerId, ySignal, boundVal) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;
        const len = ySignal.length;
        const bUp = new Array(len).fill(boundVal);
        const bDn = new Array(len).fill(-boundVal);
        Plotly.restyle(el, { y: [ySignal, bUp, bDn] }, [0, 1, 2]);
    },

    /**
     * Initial Setup for Section 5: Static vs Dynamic (Memory) Plot
     * Traces: 0: Signal x(t), 1: Probe marker at t=0, 2: Trailing memory waveform
     */
    initPropStaticDynamic(containerId, t, ySignal, probeVal, yMemory, yMax = 3.5) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;

        const trace0 = {
            x: t,
            y: ySignal,
            mode: 'lines',
            name: 'x(t)',
            line: { color: this.theme.colors.cyan, width: 2 }
        };
        const trace1 = {
            x: [0],
            y: [probeVal],
            mode: 'markers',
            name: 't=0 [Instant sample]',
            marker: { size: 8, color: this.theme.colors.gold }
        };
        const trace2 = {
            x: t,
            y: yMemory,
            mode: 'lines',
            name: 'Memory Delay Buffer',
            line: { color: this.theme.colors.violet, width: 1.6, dash: 'dot' }
        };

        const layout = this.getBaseLayout(this.theme.marginProp, [-yMax, yMax]);
        layout.showlegend = true;
        layout.legend = {
            orientation: 'h',
            y: 1.25,
            x: 0,
            font: { size: 9, color: '#64748b' }
        };

        Plotly.react(el, [trace0, trace1, trace2], layout, this.plotlyConfig);
    },

    updatePropStaticDynamic(containerId, ySignal, probeVal, yMemory) {
        const el = document.getElementById(containerId);
        if (!el || !window.Plotly) return;
        Plotly.restyle(el, { y: [ySignal, [probeVal], yMemory] }, [0, 1, 2]);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Plots;
}
if (typeof window !== 'undefined') {
    window.Plots = Plots;
}
