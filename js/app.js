/**
 * System Properties Verification Virtual Lab
 * Minimalist Application Controller & Real-Time Oscilloscope Engine
 * Styled after ameybendale/SS-virtual-lab aesthetics
 */

const App = {
    state: {
        activeTab: 'theory',
        signalId: 'sine',
        amplitude: 1.0,
        frequency: 1.0,
        phase: 0.0,
        isRunning: true,
        timeOffset: 0.0,
        plotsInitialized: false
    },

    // Fixed time grid for real-time visualization: [-3s, +3s], 220 points
    t: Utils.linspace(-3, 3, 220),
    animId: null,
    lastTimestamp: 0,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateSignalReadouts();

        // Start animation frame loop
        this.lastTimestamp = performance.now();
        this.animId = requestAnimationFrame((ts) => this.loop(ts));
    },

    cacheDOM() {
        this.dom = {
            // Navigation
            btnTabTheory: document.getElementById('btn-tab-theory'),
            btnTabExperiment: document.getElementById('btn-tab-experiment'),
            btnGotoExp: document.getElementById('btn-goto-exp'),
            viewTheory: document.getElementById('view-theory'),
            viewExperiment: document.getElementById('view-experiment'),

            // Lead Panel Controls
            selectSignal: document.getElementById('select-signal'),
            sliderAmp: document.getElementById('slider-amp'),
            valAmp: document.getElementById('val-amp'),
            sliderFreq: document.getElementById('slider-freq'),
            valFreq: document.getElementById('val-freq'),
            sliderPhase: document.getElementById('slider-phase'),
            valPhase: document.getElementById('val-phase'),

            groupFreq: document.getElementById('group-freq'),
            groupPhase: document.getElementById('group-phase'),

            btnRun: document.getElementById('btn-run'),
            btnReset: document.getElementById('btn-reset'),

            // Live status & readouts
            badgeLiveStatus: document.getElementById('badge-live-status'),
            textLiveStatus: document.getElementById('text-live-status'),
            scopeSignalDetails: document.getElementById('scope-signal-details'),
            statVpp: document.getElementById('stat-vpp'),
            statPeriod: document.getElementById('stat-period'),
            statOmega: document.getElementById('stat-omega'),

            // 5 Property rectangular tags & stats
            tagLinearity: document.getElementById('tag-linearity'),
            statLinearity: document.getElementById('stat-linearity'),

            tagCausality: document.getElementById('tag-causality'),
            statCausality: document.getElementById('stat-causality'),

            tagTimeInvariance: document.getElementById('tag-time-invariance'),
            statTimeInvariance: document.getElementById('stat-time-invariance'),

            tagStability: document.getElementById('tag-stability'),
            statStability: document.getElementById('stat-stability'),

            tagStaticDynamic: document.getElementById('tag-static-dynamic'),
            statStaticDynamic: document.getElementById('stat-static-dynamic')
        };
    },

    bindEvents() {
        // Tab switching
        if (this.dom.btnTabTheory) {
            this.dom.btnTabTheory.addEventListener('click', () => this.switchTab('theory'));
        }
        if (this.dom.btnTabExperiment) {
            this.dom.btnTabExperiment.addEventListener('click', () => this.switchTab('experiment'));
        }
        if (this.dom.btnGotoExp) {
            this.dom.btnGotoExp.addEventListener('click', () => this.switchTab('experiment'));
        }

        // Signal dropdown change
        if (this.dom.selectSignal) {
            this.dom.selectSignal.addEventListener('change', (e) => {
                this.state.signalId = e.target.value;
                this.updateSignalReadouts();
                if (!this.state.isRunning) this.renderCurrentFrame();
            });
        }

        // Sliders
        const bindSlider = (slider, output, key, fmt = (v) => Number(v).toFixed(2)) => {
            if (!slider || !output) return;
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.state[key] = val;
                output.textContent = fmt(val);
                this.updateSignalReadouts();
                if (!this.state.isRunning) this.renderCurrentFrame();
            });
        };

        bindSlider(this.dom.sliderAmp, this.dom.valAmp, 'amplitude');
        bindSlider(this.dom.sliderFreq, this.dom.valFreq, 'frequency');
        bindSlider(this.dom.sliderPhase, this.dom.valPhase, 'phase');

        // Buttons
        if (this.dom.btnRun) {
            this.dom.btnRun.addEventListener('click', () => this.toggleRun());
        }
        if (this.dom.btnReset) {
            this.dom.btnReset.addEventListener('click', () => this.resetControls());
        }

        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.state.activeTab === 'experiment' && this.state.plotsInitialized) {
                const plots = [
                    'plot-scope-input', 'plot-prop-linearity', 'plot-prop-causality',
                    'plot-prop-time-invariance', 'plot-prop-stability', 'plot-prop-static-dynamic'
                ];
                plots.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && window.Plotly) Plotly.Plots.resize(el);
                });
            }
        });
    },

    switchTab(tab) {
        this.state.activeTab = tab;
        if (tab === 'theory') {
            this.dom.viewTheory.classList.add('active');
            this.dom.viewExperiment.classList.remove('active');
            this.dom.btnTabTheory.classList.add('on');
            this.dom.btnTabExperiment.classList.remove('on');
            this.dom.btnTabTheory.setAttribute('aria-selected', 'true');
            this.dom.btnTabExperiment.setAttribute('aria-selected', 'false');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this.dom.viewTheory.classList.remove('active');
            this.dom.viewExperiment.classList.add('active');
            this.dom.btnTabTheory.classList.remove('on');
            this.dom.btnTabExperiment.classList.add('on');
            this.dom.btnTabTheory.setAttribute('aria-selected', 'false');
            this.dom.btnTabExperiment.setAttribute('aria-selected', 'true');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Initialize or resize plots after container becomes visible
            setTimeout(() => {
                if (!this.state.plotsInitialized) {
                    this.initAllPlots();
                } else {
                    const plots = [
                        'plot-scope-input', 'plot-prop-linearity', 'plot-prop-causality',
                        'plot-prop-time-invariance', 'plot-prop-stability', 'plot-prop-static-dynamic'
                    ];
                    plots.forEach(id => {
                        const el = document.getElementById(id);
                        if (el && window.Plotly) Plotly.Plots.resize(el);
                    });
                }
                this.renderCurrentFrame();
            }, 60);
        }
    },

    toggleRun() {
        this.state.isRunning = !this.state.isRunning;
        if (this.state.isRunning) {
            this.dom.btnRun.innerHTML = '&#10074;&#10074; Pause Signal';
            this.dom.btnRun.classList.add('go');
            if (this.dom.badgeLiveStatus) {
                this.dom.badgeLiveStatus.classList.remove('paused');
                this.dom.textLiveStatus.textContent = 'LIVE RUNNING';
            }
        } else {
            this.dom.btnRun.innerHTML = '&#9654; Run Signal (Live)';
            this.dom.btnRun.classList.remove('go');
            if (this.dom.badgeLiveStatus) {
                this.dom.badgeLiveStatus.classList.add('paused');
                this.dom.textLiveStatus.textContent = 'PAUSED';
            }
        }
    },

    resetControls() {
        this.state.signalId = 'sine';
        this.state.amplitude = 1.0;
        this.state.frequency = 1.0;
        this.state.phase = 0.0;
        this.state.timeOffset = 0.0;

        if (this.dom.selectSignal) this.dom.selectSignal.value = 'sine';
        if (this.dom.sliderAmp) this.dom.sliderAmp.value = '1.0';
        if (this.dom.valAmp) this.dom.valAmp.textContent = '1.00';
        if (this.dom.sliderFreq) this.dom.sliderFreq.value = '1.0';
        if (this.dom.valFreq) this.dom.valFreq.textContent = '1.00';
        if (this.dom.sliderPhase) this.dom.sliderPhase.value = '0.0';
        if (this.dom.valPhase) this.dom.valPhase.textContent = '0.00';

        if (!this.state.isRunning) {
            this.toggleRun();
        }

        this.updateSignalReadouts();
        this.renderCurrentFrame();
    },

    updateSignalReadouts() {
        const { amplitude, frequency, phase, signalId } = this.state;
        const sigDef = Signals.get(signalId) || { name: 'Sine Wave' };

        if (this.dom.scopeSignalDetails) {
            this.dom.scopeSignalDetails.textContent = `${sigDef.name} • A = ${amplitude.toFixed(2)} V, f = ${frequency.toFixed(2)} Hz, φ = ${phase.toFixed(2)} rad`;
        }

        if (this.dom.statVpp) {
            this.dom.statVpp.textContent = `${(amplitude * 2).toFixed(2)} V`;
        }
        if (this.dom.statPeriod) {
            this.dom.statPeriod.textContent = frequency > 0 ? `${(1 / frequency).toFixed(2)} s` : '—';
        }
        if (this.dom.statOmega) {
            this.dom.statOmega.textContent = `${(2 * Math.PI * frequency).toFixed(2)} rad/s`;
        }
        if (this.dom.statStability) {
            this.dom.statStability.innerHTML = `Bound Limit: <b>|x(t)| &le; ${amplitude.toFixed(2)} V &lt; &infin;</b>`;
        }
    },

    /**
     * Compute instantaneous sample value for a given time t
     */
    evalSignal(t, timeOffset = 0) {
        const { amplitude, frequency, phase, signalId } = this.state;
        const theta = 2 * Math.PI * frequency * t - timeOffset + phase;

        switch (signalId) {
            case 'sine':
                return amplitude * Math.sin(theta);
            case 'cosine':
                return amplitude * Math.cos(theta);
            case 'square':
                return amplitude * (Math.sin(theta) >= 0 ? 1 : -1);
            case 'triangular':
                return amplitude * ((2 / Math.PI) * Math.asin(Math.sin(theta)));
            case 'step':
                return (t - ((timeOffset / (2 * Math.PI * frequency)) % 4 - 2) >= 0) ? amplitude : 0;
            case 'ramp':
                const modT = ((theta / (2 * Math.PI)) % 1 + 1) % 1;
                return amplitude * (2 * modT - 1);
            case 'exponential':
                const cycle = ((theta / (2 * Math.PI)) % 1 + 1) % 1;
                return amplitude * Math.exp(-2.5 * cycle);
            default:
                return amplitude * Math.sin(theta);
        }
    },

    initAllPlots() {
        const t = this.t;
        const offset = this.state.timeOffset;
        const A = this.state.amplitude;

        // Base arrays
        const xVals = t.map(ti => this.evalSignal(ti, offset));
        const yLinear = xVals.map(x => 2 * x);
        const yNonLinear = xVals.map(x => x * x);

        const yPast = t.map(ti => this.evalSignal(ti - 0.5, offset));
        const yFuture = t.map(ti => this.evalSignal(ti + 0.5, offset));

        const yShifted = t.map(ti => this.evalSignal(ti - 1.0, offset));

        const probeVal = this.evalSignal(0, offset);
        const yMem = t.map(ti => 0.5 * this.evalSignal(ti - 0.8, offset));

        Plots.initScopeInput('plot-scope-input', t, xVals, Math.max(A * 1.5, 2.0));
        Plots.initPropLinearity('plot-prop-linearity', t, xVals, yLinear, yNonLinear, Math.max(A * 3.2, 4.0));
        Plots.initPropCausality('plot-prop-causality', t, xVals, yPast, yFuture, Math.max(A * 1.5, 2.0));
        Plots.initPropTimeInvariance('plot-prop-time-invariance', t, xVals, yShifted, Math.max(A * 1.5, 2.0));
        Plots.initPropStability('plot-prop-stability', t, xVals, A, Math.max(A * 1.5, 2.0));
        Plots.initPropStaticDynamic('plot-prop-static-dynamic', t, xVals, probeVal, yMem, Math.max(A * 1.5, 2.0));

        this.state.plotsInitialized = true;
    },

    renderCurrentFrame() {
        if (!this.state.plotsInitialized) {
            this.initAllPlots();
            return;
        }

        const t = this.t;
        const offset = this.state.timeOffset;
        const A = this.state.amplitude;

        const xVals = t.map(ti => this.evalSignal(ti, offset));
        const yLinear = xVals.map(x => 2 * x);
        const yNonLinear = xVals.map(x => x * x);

        const yPast = t.map(ti => this.evalSignal(ti - 0.5, offset));
        const yFuture = t.map(ti => this.evalSignal(ti + 0.5, offset));

        const yShifted = t.map(ti => this.evalSignal(ti - 1.0, offset));

        const probeVal = this.evalSignal(0, offset);
        const yMem = t.map(ti => 0.5 * this.evalSignal(ti - 0.8, offset));

        // Update main scope
        Plots.updateScopeInput('plot-scope-input', xVals);

        // Update 5 rectangular property plots
        Plots.updatePropLinearity('plot-prop-linearity', xVals, yLinear, yNonLinear);
        Plots.updatePropCausality('plot-prop-causality', xVals, yPast, yFuture);
        Plots.updatePropTimeInvariance('plot-prop-time-invariance', xVals, yShifted);
        Plots.updatePropStability('plot-prop-stability', xVals, A);
        Plots.updatePropStaticDynamic('plot-prop-static-dynamic', xVals, probeVal, yMem);
    },

    loop(timestamp) {
        const elapsed = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Clamp dt in case of background tab throttling
        const dt = Math.min(elapsed, 0.05);

        if (this.state.isRunning && this.state.activeTab === 'experiment') {
            // Smooth live propagation
            this.state.timeOffset += dt * this.state.frequency * 2 * Math.PI * 0.8;
            this.renderCurrentFrame();
        }

        this.animId = requestAnimationFrame((ts) => this.loop(ts));
    }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
if (typeof window !== 'undefined') {
    window.App = App;
}
