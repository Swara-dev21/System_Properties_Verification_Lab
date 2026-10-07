/**
 * System Properties Verification Virtual Lab
 * Minimal, Step-by-Step ECE Application Controller
 */

const App = {
    state: {
        activeTab: 'theory', // First view is Theory & Aim as requested
        selectedSystemId: 'scale',
        selectedProperty: 'linearity', // 'linearity' | 'timeInvariance' | 'causality' | 'stability'
        tolerance: 1e-4,

        // Test parameters
        linearity: {
            signal1: { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } },
            signal2: { id: 'cosine', params: { amplitude: 1.0, frequency: 1.0 } },
            a: 1.5,
            b: 2.0
        },

        timeInvariance: {
            signal: { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } },
            t0: 1.5
        },

        causality: {
            signal: { id: 'step', params: { amplitude: 1.0, shift: 0.0 } },
            probeTime: 0.0
        },

        stability: {
            signal: { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } },
            timeRange: [0, 10]
        },

        lastResult: null,

        // Interactive "Word Doubling" First View Demo State
        demo: {
            system: 'scale', // 'scale' (2x) or 'square' (x^2)
            baseX: 2,
            currentX: 2
        }
    },

    init() {
        this.cacheDOM();
        this.populateSystemSelector();
        this.bindEvents();
        this.bindDemoEvents();
        this.renderPropertyMatrix();
        this.updateDynamicInputs();
        this.updateSystemInfo();
        this.updateDemoDisplay();
        Utils.renderAllMath();
    },

    cacheDOM() {
        this.dom = {
            navTabs: document.querySelectorAll('.nav-tab'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            btnProceedToLab: document.getElementById('btn-proceed-to-lab'),

            // Interactive Doubling Demo
            btnDemoSysScale: document.getElementById('btn-demo-sys-scale'),
            btnDemoSysSquare: document.getElementById('btn-demo-sys-square'),
            demoInputVal: document.getElementById('demo-input-val'),
            btnDemoDouble: document.getElementById('btn-demo-double'),
            btnDemoTriple: document.getElementById('btn-demo-triple'),
            btnDemoReset: document.getElementById('btn-demo-reset'),
            demoResultText: document.getElementById('demo-result-text'),
            demoVerdictBadge: document.getElementById('demo-verdict-badge'),

            // Experiment Workbench
            systemSelect: document.getElementById('select-system'),
            systemFormulaBadge: document.getElementById('system-formula-badge'),
            systemDescText: document.getElementById('system-desc-text'),
            propertyButtons: document.querySelectorAll('.btn-prop-select'),
            dynamicControlsContainer: document.getElementById('dynamic-controls-container'),
            btnRunTest: document.getElementById('btn-run-test'),
            btnResetTest: document.getElementById('btn-reset-test'),
            btnExportReport: document.getElementById('btn-export-report'),

            // Results & Verification
            verdictBadge: document.getElementById('verdict-badge'),
            resultSummaryText: document.getElementById('result-summary-text'),
            mathConditionBox: document.getElementById('math-condition-box'),
            errorMetricBox: document.getElementById('error-metric-box'),
            explanationWhyBox: document.getElementById('explanation-why-box'),
            disclaimerBox: document.getElementById('disclaimer-box'),
            plot3Card: document.getElementById('plot-3-card'),

            // Master Matrix
            propertyMatrixBody: document.getElementById('property-matrix-body'),

            // Toast
            toast: document.getElementById('lab-toast')
        };
    },

    bindDemoEvents() {
        if (!this.dom.btnDemoDouble) return;

        // Machine selection
        this.dom.btnDemoSysScale.addEventListener('click', () => {
            this.state.demo.system = 'scale';
            this.dom.btnDemoSysScale.classList.add('active');
            this.dom.btnDemoSysSquare.classList.remove('active');
            this.updateDemoDisplay();
        });

        this.dom.btnDemoSysSquare.addEventListener('click', () => {
            this.state.demo.system = 'square';
            this.dom.btnDemoSysSquare.classList.add('active');
            this.dom.btnDemoSysScale.classList.remove('active');
            this.updateDemoDisplay();
        });

        // Double input
        this.dom.btnDemoDouble.addEventListener('click', () => {
            this.state.demo.currentX = this.state.demo.baseX * 2;
            this.updateDemoDisplay('doubled');
        });

        // Triple input
        this.dom.btnDemoTriple.addEventListener('click', () => {
            this.state.demo.currentX = this.state.demo.baseX * 3;
            this.updateDemoDisplay('tripled');
        });

        // Reset
        this.dom.btnDemoReset.addEventListener('click', () => {
            this.state.demo.currentX = this.state.demo.baseX;
            this.updateDemoDisplay('reset');
        });
    },

    updateDemoDisplay(actionType = 'initial') {
        if (!this.dom.demoInputVal) return;
        const x0 = this.state.demo.baseX; // 2
        const x = this.state.demo.currentX;
        const isScale = this.state.demo.system === 'scale';
        
        this.dom.demoInputVal.textContent = x;

        // Initial output for base input 2
        const y0 = isScale ? (2 * x0) : (x0 * x0); // 4 for both initially
        const y = isScale ? (2 * x) : (x * x);

        const panel = document.getElementById('demo-observation-panel');
        if (!panel) return;

        if (actionType === 'reset' || actionType === 'initial' || x === x0) {
            panel.innerHTML = `
                <div class="observation-step">
                    <span>Base Test State:</span> Input $x = ${x0}$ produces Output $y = ${y0}$.
                </div>
                <div class="highlight-step">
                    Now click "⚡ Double the Input!" above to test if output scales fairly!
                </div>
                <div class="observation-verdict" style="background: #e0f2fe; color: #0369a1; border-color: #0284c7;">
                    Ready for your interactive test
                </div>
            `;
        } else {
            const multiplier = x / x0;
            const outputMultiplier = y / y0;

            if (isScale) {
                // Linear System 2x
                panel.innerHTML = `
                    <div class="observation-step">
                        <span>Original:</span> Input $x = ${x0} \\implies y = ${y0}$. &nbsp;|&nbsp; <span>New:</span> Input was scaled by $\\times ${multiplier}$ to $x = ${x} \\implies y = ${y}$.
                    </div>
                    <div class="highlight-step" style="color: #059669;">
                        Did output scale by the exact same amount (${multiplier}x)? YES! (${y0} $\\times$ ${multiplier} = ${y})!
                    </div>
                    <div class="observation-verdict" style="background: #bbf7d0; color: #166534; border-color: #22c55e;">
                        ✓ Proportional Scaling Holds! That is what LINEARITY means!
                    </div>
                `;
            } else {
                // Non-linear System x^2
                panel.innerHTML = `
                    <div class="observation-step">
                        <span>Original:</span> Input $x = ${x0} \\implies y = ${y0}$. &nbsp;|&nbsp; <span>New:</span> Input was scaled by $\\times ${multiplier}$ to $x = ${x} \\implies y = ${y}$.
                    </div>
                    <div class="highlight-step" style="color: #dc2626;">
                        Did output scale by ${multiplier}x? NO! It multiplied by ${outputMultiplier}x instead of ${multiplier}x (${y0} $\\rightarrow$ ${y})!
                    </div>
                    <div class="observation-verdict" style="background: #fecdd3; color: #9f1239; border-color: #f43f5e;">
                        ✗ Violates Proportionality! This system is NON-LINEAR!
                    </div>
                `;
            }
        }
        Utils.renderAllMath(panel);
    },

    populateSystemSelector() {
        const systems = Systems.list();
        this.dom.systemSelect.innerHTML = systems.map(sys => `
            <option value="${sys.id}">System ${sys.number}: ${sys.name} [ ${sys.shortFormula} ]</option>
        `).join('');
        this.dom.systemSelect.value = this.state.selectedSystemId;
    },

    bindEvents() {
        // Navigation Tabs
        this.dom.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                this.switchTab(target);
            });
        });

        // "Proceed to Virtual Experiment" CTA in Theory Tab
        if (this.dom.btnProceedToLab) {
            this.dom.btnProceedToLab.addEventListener('click', () => {
                this.switchTab('experiment');
                this.runCurrentExperiment();
            });
        }

        // System dropdown change
        this.dom.systemSelect.addEventListener('change', (e) => {
            this.state.selectedSystemId = e.target.value;
            this.updateSystemInfo();
            this.runCurrentExperiment();
        });

        // Property button group
        this.dom.propertyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prop = btn.getAttribute('data-property');
                this.setProperty(prop);
            });
        });

        // Run Experiment button
        this.dom.btnRunTest.addEventListener('click', () => {
            this.runCurrentExperiment();
            this.showToast('Virtual Experiment executed successfully!');
            // Smoothly scroll down to results if needed
            const resultsCard = document.getElementById('card-verification-results');
            if (resultsCard) {
                resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        // Reset button
        this.dom.btnResetTest.addEventListener('click', () => {
            this.resetDefaults();
            this.showToast('Reset to default values.');
        });

        // Export Report button
        if (this.dom.btnExportReport) {
            this.dom.btnExportReport.addEventListener('click', () => {
                window.print();
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            if (window.Plotly) {
                ['plot-container-1', 'plot-container-2', 'plot-container-3'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el && el.data) Plotly.Plots.resize(el);
                });
            }
        });
    },

    switchTab(tabId) {
        this.state.activeTab = tabId;
        this.dom.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
        });
        this.dom.tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabId}`);
        });

        if (tabId === 'experiment') {
            setTimeout(() => {
                this.runCurrentExperiment();
            }, 60);
        } else if (tabId === 'summary') {
            this.renderPropertyMatrix();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        Utils.renderAllMath();
    },

    setProperty(prop) {
        this.state.selectedProperty = prop;
        this.dom.propertyButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-property') === prop);
        });
        this.updateDynamicInputs();
        this.runCurrentExperiment();
    },

    updateSystemInfo() {
        const sys = Systems.get(this.state.selectedSystemId);
        if (!sys) return;
        Utils.renderKaTeX(this.dom.systemFormulaBadge, sys.latex, true);
        this.dom.systemDescText.textContent = sys.description;
    },

    updateDynamicInputs() {
        const prop = this.state.selectedProperty;
        const container = this.dom.dynamicControlsContainer;
        const signalOptionsHtml = Object.values(Signals.definitions).map(s => `
            <option value="${s.id}">${s.name}</option>
        `).join('');

        let html = '';

        if (prop === 'linearity') {
            html = `
                <div class="params-grid-2col">
                    <div class="param-box">
                        <div class="param-box-title">
                            <span>Input Signal 1: $x_1(t)$</span>
                            <span>Weight $a = ${this.state.linearity.a}$</span>
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Waveform:</label>
                            <select id="lin-sig1-type" class="form-select">${signalOptionsHtml}</select>
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Amplitude ($A_1$): <span class="param-val" id="lin-sig1-amp-val">1.0</span></label>
                            <input type="range" id="lin-sig1-amp" min="-3" max="3" step="0.5" value="${this.state.linearity.signal1.params.amplitude}" class="form-range">
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Frequency ($f_1$): <span class="param-val" id="lin-sig1-freq-val">1.0</span> Hz</label>
                            <input type="range" id="lin-sig1-freq" min="0.5" max="3" step="0.5" value="${this.state.linearity.signal1.params.frequency}" class="form-range">
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Scale Weight ($a$): <span class="param-val" id="lin-scale-a-val">${this.state.linearity.a}</span></label>
                            <input type="range" id="lin-scale-a" min="-3" max="3" step="0.5" value="${this.state.linearity.a}" class="form-range">
                        </div>
                    </div>

                    <div class="param-box">
                        <div class="param-box-title">
                            <span>Input Signal 2: $x_2(t)$</span>
                            <span>Weight $b = ${this.state.linearity.b}$</span>
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Waveform:</label>
                            <select id="lin-sig2-type" class="form-select">${signalOptionsHtml}</select>
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Amplitude ($A_2$): <span class="param-val" id="lin-sig2-amp-val">1.0</span></label>
                            <input type="range" id="lin-sig2-amp" min="-3" max="3" step="0.5" value="${this.state.linearity.signal2.params.amplitude}" class="form-range">
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Frequency ($f_2$): <span class="param-val" id="lin-sig2-freq-val">1.0</span> Hz</label>
                            <input type="range" id="lin-sig2-freq" min="0.5" max="3" step="0.5" value="${this.state.linearity.signal2.params.frequency}" class="form-range">
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Scale Weight ($b$): <span class="param-val" id="lin-scale-b-val">${this.state.linearity.b}</span></label>
                            <input type="range" id="lin-scale-b" min="-3" max="3" step="0.5" value="${this.state.linearity.b}" class="form-range">
                        </div>
                    </div>
                </div>
            `;
        } else if (prop === 'timeInvariance') {
            html = `
                <div class="params-grid-2col">
                    <div class="param-box">
                        <div class="param-box-title">Input Signal $x(t)$</div>
                        <div class="param-row">
                            <label class="param-row-label">Waveform:</label>
                            <select id="ti-sig-type" class="form-select">${signalOptionsHtml}</select>
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Amplitude ($A$): <span class="param-val" id="ti-sig-amp-val">1.0</span></label>
                            <input type="range" id="ti-sig-amp" min="-3" max="3" step="0.5" value="${this.state.timeInvariance.signal.params.amplitude}" class="form-range">
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Frequency ($f$): <span class="param-val" id="ti-sig-freq-val">1.0</span> Hz</label>
                            <input type="range" id="ti-sig-freq" min="0.5" max="3" step="0.5" value="${this.state.timeInvariance.signal.params.frequency}" class="form-range">
                        </div>
                    </div>

                    <div class="param-box">
                        <div class="param-box-title">Time Shift Parameter</div>
                        <div class="param-row">
                            <label class="param-row-label">Delay Amount ($t_0$): <span class="param-val" id="ti-shift-t0-val">${this.state.timeInvariance.t0}</span> s</label>
                            <input type="range" id="ti-shift-t0" min="-2.5" max="2.5" step="0.5" value="${this.state.timeInvariance.t0}" class="form-range">
                        </div>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 10px;">
                            The experiment verifies if delaying input by $t_0$ produces identical delay $t_0$ in the output.
                        </p>
                    </div>
                </div>
            `;
        } else if (prop === 'causality') {
            html = `
                <div class="params-grid-2col">
                    <div class="param-box">
                        <div class="param-box-title">Base Test Signal $x(t)$</div>
                        <div class="param-row">
                            <label class="param-row-label">Waveform:</label>
                            <select id="caus-sig-type" class="form-select">${signalOptionsHtml}</select>
                        </div>
                    </div>

                    <div class="param-box">
                        <div class="param-box-title">Causality Observation Instant</div>
                        <div class="param-row">
                            <label class="param-row-label">Present Instant ($t_0$): <span class="param-val" id="caus-probe-time-val">${this.state.causality.probeTime}</span> s</label>
                            <input type="range" id="caus-probe-time" min="-2" max="2" step="0.5" value="${this.state.causality.probeTime}" class="form-range">
                        </div>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 10px;">
                            A disturbance will be injected strictly in the future ($t > t_0$). If present output changes, the system is non-causal.
                        </p>
                    </div>
                </div>
            `;
        } else if (prop === 'stability') {
            html = `
                <div class="params-grid-2col">
                    <div class="param-box">
                        <div class="param-box-title">Bounded Test Signal ($|x(t)| \\le M_x$)</div>
                        <div class="param-row">
                            <label class="param-row-label">Waveform:</label>
                            <select id="stab-sig-type" class="form-select">
                                <option value="sine">Sine Wave (Bounded)</option>
                                <option value="step">Unit Step u(t) (Bounded, Mx=1)</option>
                                <option value="exponential">Decaying Exponential (Bounded)</option>
                                <option value="pulse">Rectangular Pulse (Bounded)</option>
                                <option value="cosine">Cosine Wave (Bounded)</option>
                            </select>
                        </div>
                        <div class="param-row">
                            <label class="param-row-label">Input Bound ($M_x$): <span class="param-val" id="stab-sig-amp-val">1.0</span></label>
                            <input type="range" id="stab-sig-amp" min="0.5" max="3" step="0.5" value="${this.state.stability.signal.params.amplitude}" class="form-range">
                        </div>
                    </div>

                    <div class="param-box">
                        <div class="param-box-title">Observation Horizon</div>
                        <div class="param-row">
                            <label class="param-row-label">Time Window ($t_{\\max}$): <span class="param-val" id="stab-time-horizon-val">10</span> s</label>
                            <input type="range" id="stab-time-horizon" min="5" max="20" step="5" value="${this.state.stability.timeRange[1]}" class="form-range">
                        </div>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 10px;">
                            Tracks if peak output $|y(t)|$ remains bounded or grows unboundedly over time.
                        </p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        this.bindDynamicListeners();
        Utils.renderAllMath(container);
    },

    bindDynamicListeners() {
        const prop = this.state.selectedProperty;

        if (prop === 'linearity') {
            const s1 = document.getElementById('lin-sig1-type');
            const s2 = document.getElementById('lin-sig2-type');
            const a1 = document.getElementById('lin-sig1-amp');
            const f1 = document.getElementById('lin-sig1-freq');
            const sa = document.getElementById('lin-scale-a');
            const a2 = document.getElementById('lin-sig2-amp');
            const f2 = document.getElementById('lin-sig2-freq');
            const sb = document.getElementById('lin-scale-b');

            if (s1) s1.value = this.state.linearity.signal1.id;
            if (s2) s2.value = this.state.linearity.signal2.id;

            const onInput = () => {
                this.state.linearity.signal1.id = s1.value;
                this.state.linearity.signal1.params.amplitude = parseFloat(a1.value);
                this.state.linearity.signal1.params.frequency = parseFloat(f1.value);
                this.state.linearity.a = parseFloat(sa.value);

                this.state.linearity.signal2.id = s2.value;
                this.state.linearity.signal2.params.amplitude = parseFloat(a2.value);
                this.state.linearity.signal2.params.frequency = parseFloat(f2.value);
                this.state.linearity.b = parseFloat(sb.value);

                document.getElementById('lin-sig1-amp-val').textContent = a1.value;
                document.getElementById('lin-sig1-freq-val').textContent = f1.value;
                document.getElementById('lin-scale-a-val').textContent = sa.value;
                document.getElementById('lin-sig2-amp-val').textContent = a2.value;
                document.getElementById('lin-sig2-freq-val').textContent = f2.value;
                document.getElementById('lin-scale-b-val').textContent = sb.value;
            };

            [s1, s2, a1, f1, sa, a2, f2, sb].forEach(el => el && el.addEventListener('input', onInput));
        } else if (prop === 'timeInvariance') {
            const s = document.getElementById('ti-sig-type');
            const a = document.getElementById('ti-sig-amp');
            const f = document.getElementById('ti-sig-freq');
            const t0 = document.getElementById('ti-shift-t0');

            if (s) s.value = this.state.timeInvariance.signal.id;

            const onInput = () => {
                this.state.timeInvariance.signal.id = s.value;
                this.state.timeInvariance.signal.params.amplitude = parseFloat(a.value);
                this.state.timeInvariance.signal.params.frequency = parseFloat(f.value);
                this.state.timeInvariance.t0 = parseFloat(t0.value);

                document.getElementById('ti-sig-amp-val').textContent = a.value;
                document.getElementById('ti-sig-freq-val').textContent = f.value;
                document.getElementById('ti-shift-t0-val').textContent = t0.value;
            };

            [s, a, f, t0].forEach(el => el && el.addEventListener('input', onInput));
        } else if (prop === 'causality') {
            const s = document.getElementById('caus-sig-type');
            const p = document.getElementById('caus-probe-time');

            if (s) s.value = this.state.causality.signal.id;

            const onInput = () => {
                this.state.causality.signal.id = s.value;
                this.state.causality.probeTime = parseFloat(p.value);
                document.getElementById('caus-probe-time-val').textContent = p.value;
            };

            [s, p].forEach(el => el && el.addEventListener('input', onInput));
        } else if (prop === 'stability') {
            const s = document.getElementById('stab-sig-type');
            const a = document.getElementById('stab-sig-amp');
            const th = document.getElementById('stab-time-horizon');

            if (s) s.value = this.state.stability.signal.id;

            const onInput = () => {
                this.state.stability.signal.id = s.value;
                this.state.stability.signal.params.amplitude = parseFloat(a.value);
                this.state.stability.timeRange = [0, parseFloat(th.value)];

                document.getElementById('stab-sig-amp-val').textContent = a.value;
                document.getElementById('stab-time-horizon-val').textContent = th.value;
            };

            [s, a, th].forEach(el => el && el.addEventListener('input', onInput));
        }
    },

    runCurrentExperiment() {
        const sysId = this.state.selectedSystemId;
        const prop = this.state.selectedProperty;
        const plots = {
            inputs: 'plot-container-1',
            outputs: 'plot-container-2',
            difference: 'plot-container-3'
        };

        let result = null;

        if (prop === 'linearity') {
            this.dom.plot3Card.style.display = 'block';
            result = LinearityTester.run({
                system: sysId,
                signal1: this.state.linearity.signal1,
                signal2: this.state.linearity.signal2,
                a: this.state.linearity.a,
                b: this.state.linearity.b,
                tolerance: this.state.tolerance
            });
            Plots.renderLinearity(plots, result);
        } else if (prop === 'timeInvariance') {
            this.dom.plot3Card.style.display = 'block';
            result = TimeInvarianceTester.run({
                system: sysId,
                signal: this.state.timeInvariance.signal,
                t0: this.state.timeInvariance.t0,
                tolerance: this.state.tolerance
            });
            Plots.renderTimeInvariance(plots, result);
        } else if (prop === 'causality') {
            this.dom.plot3Card.style.display = 'block';
            result = CausalityTester.run({
                system: sysId,
                signal: this.state.causality.signal,
                probeTime: this.state.causality.probeTime
            });
            Plots.renderCausality(plots, result);
        } else if (prop === 'stability') {
            this.dom.plot3Card.style.display = 'none';
            result = StabilityTester.run({
                system: sysId,
                signal: this.state.stability.signal,
                timeRange: this.state.stability.timeRange
            });
            Plots.renderStability(plots, result);
        }

        this.state.lastResult = result;
        this.renderVerificationOutput(result);
    },

    renderVerificationOutput(result) {
        if (!result) return;
        const exp = result.explanation;

        // Verdict Badge
        this.dom.verdictBadge.className = `verdict-pill ${exp.statusClass}`;
        this.dom.verdictBadge.textContent = exp.verdict;

        // Summary text
        this.dom.resultSummaryText.innerHTML = exp.summary;

        // Mathematical condition
        this.dom.mathConditionBox.innerHTML = '';
        Utils.renderKaTeX(this.dom.mathConditionBox, exp.mathTest, true);

        // Error metric
        if (exp.errorDetails) {
            this.dom.errorMetricBox.style.display = 'block';
            this.dom.errorMetricBox.innerHTML = `<strong>Observed Numerical Metric:</strong><br>${exp.errorDetails}`;
        } else if (exp.dependencyDetails) {
            this.dom.errorMetricBox.style.display = 'block';
            this.dom.errorMetricBox.innerHTML = `<strong>Timeline Analysis:</strong><br>${exp.dependencyDetails}`;
        } else if (exp.envelopeDetails) {
            this.dom.errorMetricBox.style.display = 'block';
            this.dom.errorMetricBox.innerHTML = `<strong>Gain / Envelope Analysis:</strong><br>${exp.envelopeDetails}`;
        } else {
            this.dom.errorMetricBox.style.display = 'none';
        }

        // Why? Explanation box
        this.dom.explanationWhyBox.innerHTML = `<strong>ECE Theoretical Explanation:</strong><p>${exp.why}</p>`;

        // Disclaimer box
        if (exp.disclaimer) {
            this.dom.disclaimerBox.style.display = 'block';
            this.dom.disclaimerBox.innerHTML = `<strong>Academic Note:</strong> ${exp.disclaimer}`;
        } else {
            this.dom.disclaimerBox.style.display = 'none';
        }

        Utils.renderAllMath(document.getElementById('card-verification-results'));
    },

    renderPropertyMatrix() {
        if (!this.dom.propertyMatrixBody) return;
        const systems = Systems.list();

        this.dom.propertyMatrixBody.innerHTML = systems.map(sys => {
            const p = sys.expectedProperties;
            return `
                <tr>
                    <td style="font-weight: 600; color: var(--text-dim);">${sys.number}</td>
                    <td>
                        <strong style="color: var(--text-heading);">${sys.name}</strong>
                        <div id="matrix-latex-${sys.id}" style="color: var(--primary-blue); margin-top: 4px;"></div>
                    </td>
                    <td>
                        <span class="badge-pill ${p.linearity.isLinear ? 'badge-pass' : 'badge-fail'}">
                            ${p.linearity.isLinear ? '✓ Linear' : '✗ Non-linear'}
                        </span>
                    </td>
                    <td>
                        <span class="badge-pill ${p.timeInvariance.isTimeInvariant ? 'badge-pass' : 'badge-fail'}">
                            ${p.timeInvariance.isTimeInvariant ? '✓ Time Invariant' : '✗ Time Varying'}
                        </span>
                    </td>
                    <td>
                        <span class="badge-pill ${p.causality.isCausal ? 'badge-pass' : 'badge-fail'}">
                            ${p.causality.isCausal ? '✓ Causal' : '✗ Non-causal'}
                        </span>
                    </td>
                    <td>
                        <span class="badge-pill ${p.stability.isStable ? 'badge-pass' : 'badge-fail'}">
                            ${p.stability.isStable ? '✓ BIBO Stable' : '✗ Unstable'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-matrix-load" onclick="App.quickLaunchSystem('${sys.id}')">
                            Test System
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        systems.forEach(sys => {
            const el = document.getElementById(`matrix-latex-${sys.id}`);
            if (el) Utils.renderKaTeX(el, sys.latex);
        });
    },

    quickLaunchSystem(sysId) {
        this.state.selectedSystemId = sysId;
        this.dom.systemSelect.value = sysId;
        this.updateSystemInfo();
        this.switchTab('experiment');
        this.runCurrentExperiment();
        this.showToast(`Loaded ${Systems.get(sysId).name} into Workbench!`);
    },

    resetDefaults() {
        this.state.tolerance = 1e-4;
        this.state.linearity = {
            signal1: { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } },
            signal2: { id: 'cosine', params: { amplitude: 1.0, frequency: 1.0 } },
            a: 1.5,
            b: 2.0
        };
        this.state.timeInvariance = {
            signal: { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } },
            t0: 1.5
        };
        this.state.causality = {
            signal: { id: 'step', params: { amplitude: 1.0, shift: 0.0 } },
            probeTime: 0.0
        };
        this.state.stability = {
            signal: { id: 'sine', params: { amplitude: 1.0, frequency: 1.0 } },
            timeRange: [0, 10]
        };

        this.updateDynamicInputs();
        this.runCurrentExperiment();
    },

    showToast(message, duration = 2500) {
        if (!this.dom.toast) return;
        this.dom.toast.textContent = message;
        this.dom.toast.classList.add('visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            this.dom.toast.classList.remove('visible');
        }, duration);
    }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Refresh math when CDN assets finish loading
window.addEventListener('load', () => {
    App.updateSystemInfo();
    App.renderPropertyMatrix();
    Utils.renderAllMath();
});
