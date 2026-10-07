/**
 * System Properties Verification Virtual Lab
 * Plotly-based Interactive Graph Rendering Engine
 */

const Plots = {
    // Crisp Engineering Notebook Theme for Plotly
    theme: {
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#faf8f5',
        font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            color: '#334155',
            size: 11
        },
        margin: { l: 50, r: 25, t: 35, b: 40 },
        gridcolor: 'rgba(0, 0, 0, 0.08)',
        zerolinecolor: 'rgba(0, 0, 0, 0.25)',
        colors: {
            cyan: '#0284c7',      // Deep Sky Blue
            violet: '#7c3aed',    // Violet Ink
            emerald: '#059669',   // Forest Green
            amber: '#d97706',     // Ochre Amber
            rose: '#dc2626',      // Crimson Red
            blue: '#2563eb',      // Royal Blue
            indigo: '#4f46e5',
            slate: '#64748b'
        }
    },

    plotlyConfig: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        toImageButtonOptions: {
            format: 'png',
            filename: 'system_properties_lab_plot',
            height: 450,
            width: 750,
            scale: 2
        }
    },

    getBaseLayout(title, xTitle = 'Time t (s)', yTitle = 'Amplitude') {
        return {
            title: {
                text: title,
                font: { size: 13, color: '#1e293b', weight: 600 },
                x: 0.05
            },
            paper_bgcolor: this.theme.paper_bgcolor,
            plot_bgcolor: this.theme.plot_bgcolor,
            font: this.theme.font,
            margin: this.theme.margin,
            showlegend: true,
            legend: {
                orientation: 'h',
                yanchor: 'bottom',
                y: 1.02,
                xanchor: 'right',
                x: 1,
                font: { size: 10, color: '#475569' }
            },
            xaxis: {
                title: { text: xTitle, font: { size: 11, color: '#475569' } },
                gridcolor: this.theme.gridcolor,
                zerolinecolor: this.theme.zerolinecolor,
                tickfont: { size: 10, color: '#64748b' },
                showgrid: true,
                zeroline: true
            },
            yaxis: {
                title: { text: yTitle, font: { size: 11, color: '#475569' } },
                gridcolor: this.theme.gridcolor,
                zerolinecolor: this.theme.zerolinecolor,
                tickfont: { size: 10, color: '#64748b' },
                showgrid: true,
                zeroline: true,
                autorange: true
            },
            hovermode: 'x unified',
            hoverlabel: {
                bgcolor: '#ffffff',
                bordercolor: '#94a3b8',
                font: { family: 'Inter', size: 11, color: '#0f172a' }
            }
        };
    },

    /**
     * Render plots for Linearity Experiment
     */
    renderLinearity(containers, data) {
        const t = data.inputs.t;
        const c = this.theme.colors;

        // Plot 1: Inputs
        const traceX1 = {
            x: t,
            y: data.inputs.x1.values,
            mode: 'lines',
            name: `x₁(t) [${data.inputs.x1.name}]`,
            line: { color: c.cyan, width: 2, dash: 'dot' }
        };
        const traceX2 = {
            x: t,
            y: data.inputs.x2.values,
            mode: 'lines',
            name: `x₂(t) [${data.inputs.x2.name}]`,
            line: { color: c.violet, width: 2, dash: 'dot' }
        };
        const traceXComb = {
            x: t,
            y: data.inputs.combined.values,
            mode: 'lines',
            name: `Combined: a·x₁ + b·x₂ (a=${data.inputs.x1.a}, b=${data.inputs.x2.b})`,
            line: { color: '#38bdf8', width: 2.5 }
        };

        const layoutInputs = this.getBaseLayout('Input Signals x₁(t), x₂(t) and Linear Combination', 'Time t (s)', 'Input Amplitude');
        Plotly.react(containers.inputs, [traceX1, traceX2, traceXComb], layoutInputs, this.plotlyConfig);

        // Plot 2: Outputs (LHS vs RHS)
        const traceLHS = {
            x: t,
            y: data.outputs.lhs,
            mode: 'lines',
            name: 'LHS: T{a·x₁ + b·x₂}',
            line: { color: c.emerald, width: 3 }
        };
        const traceRHS = {
            x: t,
            y: data.outputs.rhs,
            mode: 'lines',
            name: 'RHS: a·T{x₁} + b·T{x₂}',
            line: { color: c.amber, width: 2, dash: 'dash' }
        };

        const layoutOutputs = this.getBaseLayout('Superposition Comparison: LHS vs RHS', 'Time t (s)', 'System Output');
        Plotly.react(containers.outputs, [traceLHS, traceRHS], layoutOutputs, this.plotlyConfig);

        // Plot 3: Error / Difference
        const traceDiff = {
            x: t,
            y: data.outputs.difference,
            mode: 'lines',
            name: 'Difference (LHS - RHS)',
            line: { color: c.rose, width: 2 },
            fill: 'tozeroy',
            fillcolor: 'rgba(244, 63, 94, 0.12)'
        };

        const tol = data.metrics.tolerance;
        const layoutDiff = this.getBaseLayout(`Error Signal: LHS - RHS (Max Error: ${Utils.formatNumber(data.metrics.maxError)})`, 'Time t (s)', 'Residual Error');
        layoutDiff.shapes = [
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: tol,
                y1: tol,
                line: { color: 'rgba(245, 158, 11, 0.6)', width: 1.5, dash: 'dashdot' }
            },
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: -tol,
                y1: -tol,
                line: { color: 'rgba(245, 158, 11, 0.6)', width: 1.5, dash: 'dashdot' }
            }
        ];
        layoutDiff.annotations = [
            {
                x: t[t.length - 1],
                y: tol,
                xref: 'x',
                yref: 'y',
                text: `+Tolerance (${Utils.formatNumber(tol)})`,
                showarrow: false,
                xanchor: 'right',
                yanchor: 'bottom',
                font: { size: 9, color: '#f59e0b' }
            }
        ];

        Plotly.react(containers.difference, [traceDiff], layoutDiff, this.plotlyConfig);
    },

    /**
     * Render plots for Time Invariance Experiment
     */
    renderTimeInvariance(containers, data) {
        const t = data.inputs.t;
        const c = this.theme.colors;
        const t0 = data.t0;

        // Plot 1: Shifted Input
        const traceXOrig = {
            x: t,
            y: data.inputs.original.values,
            mode: 'lines',
            name: `Original Input x(t)`,
            line: { color: c.cyan, width: 2 }
        };
        const traceXShift = {
            x: t,
            y: data.inputs.shifted.values,
            mode: 'lines',
            name: `Shifted Input x(t - ${t0})`,
            line: { color: c.violet, width: 2, dash: 'dash' }
        };

        const layoutInputs = this.getBaseLayout(`Input Signals: Original x(t) vs Shifted x(t - ${t0})`, 'Time t (s)', 'Input Amplitude');
        Plotly.react(containers.inputs, [traceXOrig, traceXShift], layoutInputs, this.plotlyConfig);

        // Plot 2: Outputs (Path 1 vs Path 2)
        const tracePath1 = {
            x: t,
            y: data.outputs.y1Delayed,
            mode: 'lines',
            name: `Path 1: Delayed Output y(t - ${t0})`,
            line: { color: c.emerald, width: 3 }
        };
        const tracePath2 = {
            x: t,
            y: data.outputs.y2Shifted,
            mode: 'lines',
            name: `Path 2: Output to Shifted Input T{x(t - ${t0})}`,
            line: { color: c.amber, width: 2, dash: 'dash' }
        };

        const layoutOutputs = this.getBaseLayout('Time Invariance Test: Delayed Output vs Output to Delayed Input', 'Time t (s)', 'System Output');
        Plotly.react(containers.outputs, [tracePath1, tracePath2], layoutOutputs, this.plotlyConfig);

        // Plot 3: Difference
        const traceDiff = {
            x: t,
            y: data.outputs.difference,
            mode: 'lines',
            name: `Shift Discrepancy (Path 2 - Path 1)`,
            line: { color: c.rose, width: 2 },
            fill: 'tozeroy',
            fillcolor: 'rgba(244, 63, 94, 0.12)'
        };

        const tol = data.metrics.tolerance;
        const layoutDiff = this.getBaseLayout(`Shift Error: Path 2 - Path 1 (Max Error: ${Utils.formatNumber(data.metrics.maxError)})`, 'Time t (s)', 'Shift Error');
        layoutDiff.shapes = [
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: tol,
                y1: tol,
                line: { color: 'rgba(245, 158, 11, 0.6)', width: 1.5, dash: 'dashdot' }
            },
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: -tol,
                y1: -tol,
                line: { color: 'rgba(245, 158, 11, 0.6)', width: 1.5, dash: 'dashdot' }
            }
        ];

        Plotly.react(containers.difference, [traceDiff], layoutDiff, this.plotlyConfig);
    },

    /**
     * Render plots for Causality Experiment
     */
    renderCausality(containers, data) {
        const t = data.inputs.t;
        const c = this.theme.colors;
        const pTime = data.probeTime;

        // Plot 1: Future Perturbation Test Inputs
        const traceBase = {
            x: t,
            y: data.inputs.base.values,
            mode: 'lines',
            name: 'Original Input x(t)',
            line: { color: c.cyan, width: 2 }
        };
        const tracePert = {
            x: t,
            y: data.inputs.perturbed.values,
            mode: 'lines',
            name: 'Perturbed Input (Future Disturbance at t > t_probe)',
            line: { color: c.violet, width: 2, dash: 'dash' }
        };

        const layoutInputs = this.getBaseLayout(`Inputs: Future Perturbation Injected at t = ${data.perturbCenter} (strictly after t_probe = ${pTime})`, 'Time t (s)', 'Amplitude');
        // Vertical line at probe time and shaded future zone
        layoutInputs.shapes = [
            {
                type: 'line',
                x0: pTime,
                x1: pTime,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: { color: '#38bdf8', width: 2, dash: 'dot' }
            },
            {
                type: 'rect',
                x0: pTime,
                x1: t[t.length - 1],
                y0: 0,
                y1: 1,
                yref: 'paper',
                fillcolor: 'rgba(168, 85, 247, 0.08)',
                line: { width: 0 }
            }
        ];
        layoutInputs.annotations = [
            {
                x: pTime,
                y: 1,
                yref: 'paper',
                text: `Present Observation (t = ${pTime})`,
                showarrow: true,
                arrowhead: 2,
                arrowcolor: '#38bdf8',
                ax: -40,
                ay: -25,
                font: { size: 10, color: '#38bdf8' }
            },
            {
                x: (pTime + t[t.length - 1]) / 2,
                y: 0.05,
                yref: 'paper',
                text: 'FUTURE REGION (t > t_probe)',
                showarrow: false,
                font: { size: 10, color: 'rgba(168, 85, 247, 0.7)' }
            }
        ];

        Plotly.react(containers.inputs, [traceBase, tracePert], layoutInputs, this.plotlyConfig);

        // Plot 2: Outputs
        const traceYBase = {
            x: t,
            y: data.outputs.base,
            mode: 'lines',
            name: 'Original Output y_base(t)',
            line: { color: c.emerald, width: 2.5 }
        };
        const traceYPert = {
            x: t,
            y: data.outputs.perturbed,
            mode: 'lines',
            name: 'Perturbed Output y_pert(t)',
            line: { color: c.rose, width: 2, dash: 'dash' }
        };

        const layoutOutputs = this.getBaseLayout(`System Response: Does Present/Past Output React to Future Input?`, 'Time t (s)', 'Output Amplitude');
        layoutOutputs.shapes = [
            {
                type: 'line',
                x0: pTime,
                x1: pTime,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: { color: '#38bdf8', width: 2, dash: 'dot' }
            }
        ];

        Plotly.react(containers.outputs, [traceYBase, traceYPert], layoutOutputs, this.plotlyConfig);

        // Plot 3: Output Difference (Leakage into present/past)
        const traceDiff = {
            x: t,
            y: data.outputs.difference,
            mode: 'lines',
            name: 'Output Disturbance: y_pert(t) - y_base(t)',
            line: { color: c.amber, width: 2 },
            fill: 'tozeroy',
            fillcolor: 'rgba(245, 158, 11, 0.15)'
        };

        const layoutDiff = this.getBaseLayout(`Causality Leakage Test: Non-zero at t ≤ ${pTime} signifies Non-Causal Anticipation`, 'Time t (s)', 'Difference');
        layoutDiff.shapes = [
            {
                type: 'line',
                x0: pTime,
                x1: pTime,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: { color: '#38bdf8', width: 2, dash: 'dot' }
            }
        ];

        Plotly.react(containers.difference, [traceDiff], layoutDiff, this.plotlyConfig);
    },

    /**
     * Render plots for Stability Experiment
     */
    renderStability(containers, data) {
        const t = data.inputs.t;
        const c = this.theme.colors;
        const mx = data.inputs.boundMx;
        const my = data.outputs.peakMy;

        // Plot 1: Bounded Input Signal
        const traceX = {
            x: t,
            y: data.inputs.signal.values,
            mode: 'lines',
            name: `Test Input x(t) [${data.inputs.signal.name}]`,
            line: { color: c.cyan, width: 2 }
        };

        const layoutInputs = this.getBaseLayout(`Bounded Test Input (|x(t)| ≤ M_x = ${Utils.formatNumber(mx, 2)})`, 'Time t (s)', 'Input Amplitude');
        layoutInputs.shapes = [
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: mx,
                y1: mx,
                line: { color: c.emerald, width: 1.5, dash: 'dash' }
            },
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: -mx,
                y1: -mx,
                line: { color: c.emerald, width: 1.5, dash: 'dash' }
            }
        ];
        layoutInputs.annotations = [
            {
                x: t[t.length - 1],
                y: mx,
                text: `+M_x (${Utils.formatNumber(mx, 2)})`,
                showarrow: false,
                xanchor: 'right',
                yanchor: 'bottom',
                font: { size: 10, color: c.emerald }
            }
        ];

        Plotly.react(containers.inputs, [traceX], layoutInputs, this.plotlyConfig);

        // Plot 2: Output Signal
        const traceY = {
            x: t,
            y: data.outputs.y,
            mode: 'lines',
            name: 'Output y(t) = T{x(t)}',
            line: { color: c.emerald, width: 2.5 }
        };
        const traceEnvelope = {
            x: t,
            y: data.outputs.runningPeakY,
            mode: 'lines',
            name: 'Cumulative Peak Envelope max |y(τ)|',
            line: { color: c.amber, width: 1.5, dash: 'dash' }
        };

        const layoutOutputs = this.getBaseLayout(`Output Signal & Running Envelope (Observed Peak M_y = ${Utils.formatNumber(my, 2)})`, 'Time t (s)', 'Output Amplitude');
        layoutOutputs.shapes = [
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: my,
                y1: my,
                line: { color: c.amber, width: 1.5, dash: 'dot' }
            },
            {
                type: 'line',
                x0: t[0],
                x1: t[t.length - 1],
                y0: -my,
                y1: -my,
                line: { color: c.amber, width: 1.5, dash: 'dot' }
            }
        ];

        Plotly.react(containers.outputs, [traceY, traceEnvelope], layoutOutputs, this.plotlyConfig);
    }
};

window.Plots = Plots;
