# System Properties Verification Virtual Lab

An interactive, educational **Virtual Laboratory** designed for Signals and Systems practical experiments. The platform allows students and instructors to select canonical mathematical systems, inject test signals, and experimentally verify fundamental system properties in real time.

---

## 🚀 Live Demo & Deployment

This project is built as a **pure client-side web application** (HTML5, CSS3, JavaScript ES6+), requiring **zero backend servers or databases**. It can be deployed directly to **GitHub Pages** or any static web host.

### Local Execution
1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser (Google Chrome, Firefox, Edge, Safari).
3. Alternatively, serve via any static web server:
   ```bash
   # Using Python 3 (optional)
   python -m http.server 8000
   
   # Using Node.js npx serve (optional)
   npx serve .
   ```

---

## 🎯 Supported Canonical Systems

The virtual lab features 8 predefined, mathematically robust systems:

| # | System Equation | Operation | Linearity | Time Invariance | Causality | BIBO Stability |
|---|---|---|---|---|---|---|
| **1** | $y(t) = 2x(t)$ | Linear Scaling | ✓ Linear | ✓ Time Invariant | ✓ Causal | ✓ Stable |
| **2** | $y(t) = x^2(t)$ | Squaring | ✗ Non-linear | ✓ Time Invariant | ✓ Causal | ✓ Stable |
| **3** | $y(t) = x(t-2)$ | Time Delay | ✓ Linear | ✓ Time Invariant | ✓ Causal | ✓ Stable |
| **4** | $y(t) = t \cdot x(t)$ | Time-Varying Scaling | ✓ Linear | ✗ Time Varying | ✓ Causal | ✗ Not Stable |
| **5** | $y(t) = \|x(t)\|$ | Absolute Value | ✗ Non-linear | ✓ Time Invariant | ✓ Causal | ✓ Stable |
| **6** | $y(t) = \frac{dx(t)}{dt}$ | Differentiator | ✓ Linear | ✓ Time Invariant | ✓ Causal | ✗ Not Stable |
| **7** | $y(t) = \int_{-\infty}^{t} x(\tau) d\tau$ | Integrator | ✓ Linear | ✓ Time Invariant | ✓ Causal | ✗ Not Stable |
| **8** | $y(t) = x(t+2)$ | Time Advance | ✓ Linear | ✓ Time Invariant | ✗ Non-Causal | ✓ Stable |

---

## 🔬 Property Verification Methodologies

The lab does not merely display textbook classifications—students perform an empirical virtual experiment:

### 1. Linearity Verification
Tests the superposition principle:
$$T\{a x_1(t) + b x_2(t)\} = a T\{x_1(t)\} + b T\{x_2(t)\}$$
- Computes LHS (system applied to combined input $a x_1 + b x_2$).
- Computes RHS (weighted sum of individual responses $a y_1 + b y_2$).
- Displays overlay plots of LHS vs RHS and plots the error signal:
  $$\text{Difference}(t) = \text{LHS} - \text{RHS}$$
- Evaluates maximum absolute error against tolerance $\epsilon_{\max} < 10^{-4}$.

### 2. Time-Invariance Verification
Tests the shift commutativity property:
$$T\{x(t - t_0)\} = y(t - t_0) \quad \text{where } y(t) = T\{x(t)\}$$
- Path 1: Evaluates original output $y_1(t) = T\{x(t)\}$ and shifts by $t_0 \implies y_1(t - t_0)$.
- Path 2: Shifts input $x(t - t_0)$ and evaluates output $y_2(t) = T\{x(t - t_0)\}$.
- Compares Path 1 vs Path 2 and measures discrepancy error over the valid time horizon.

### 3. Causality Verification
Verifies that the output at any present observation instant $t_{\text{probe}}$ depends solely on present and past input values ($\tau \le t_{\text{probe}}$):
- **Timeline Probe**: Maps the exact sample time needed to evaluate $y(t_{\text{probe}})$.
- **Future Perturbation Experiment**: Injects an unexpected disturbance strictly in the future ($t > t_{\text{probe}}$).
- Observes whether present or past output reacts prematurely. For the time advance system $y(t) = x(t+2)$, the disturbance leaks backward in time, empirically demonstrating non-causality.

### 4. BIBO Stability Verification
Tests the Bounded-Input Bounded-Output definition:
$$|x(t)| \le M_x < \infty \implies |y(t)| \le M_y < \infty$$
- Injects bounded test waveforms (Sine, Step, Decaying Exponential, Rectangular Pulse).
- Tracks output peak amplitude $M_y$ and running envelope $\max_{0 \le \tau \le t} |y(\tau)|$.
- For unstable systems ($y(t) = t x(t)$ and integrator with $u(t)$), demonstrates asymptotic growth and divergence.
- Explicitly provides the theoretical proof (e.g., impulse response absolute integrability $\int_{-\infty}^\infty |h(\tau)| d\tau < \infty$), highlighting the academic principle that a finite simulation window alone does not constitute universal proof.

---

## 📂 Project Architecture

```text
System_Properties_Verification_Lab/
├── index.html                           # Main web application entrypoint
├── css/
│   └── style.css                        # Glassmorphic dark lab theme & print styles
├── js/
│   ├── utils.js                         # Numerical math utilities, tolerance & KaTeX helpers
│   ├── signals.js                       # Signal library (Sine, Cosine, Step, Ramp, Pulse, Exp)
│   ├── systems.js                       # Mathematical definitions & theoretical properties of 8 systems
│   ├── plots.js                         # Plotly.js oscilloscope and graph renderers
│   ├── linearity.js                     # Superposition LHS vs RHS verification engine
│   ├── timeInvariance.js                # Time shift commutativity verification engine
│   ├── causality.js                     # Temporal probe & perturbation experiment engine
│   ├── stability.js                     # BIBO bound tracking & growth analysis engine
│   └── app.js                           # UI controller, state management & stepper logic
├── README.md                            # Comprehensive laboratory documentation
└── LICENSE                              # Open-source MIT License
```

---

## 🛠️ Technology Stack

- **HTML5 & Modern CSS3**: Semantic layouts, CSS Grid, Flexbox, glassmorphic backdrop filters, custom scrollbars, and printable report stylesheet.
- **JavaScript ES6+**: Modular functional architecture with clean separation between numerical math engines and DOM controllers.
- **Plotly.js (v2.32.0)**: Interactive, zoomable oscilloscopes with high-contrast signal traces.
- **KaTeX (v0.16.10)**: Fast browser-side mathematical typesetting.

---

## 📜 License

MIT License. Free for academic, university, and educational use.
