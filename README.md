# System Properties Verification Virtual Lab

An interactive, educational **Virtual Laboratory** designed for **Signals and Systems** practical experiments in Electronics, Electrical, and Computer Engineering. The platform allows students and instructors to select or enter input signals and mathematical systems, visualize input/output waveforms, and experimentally verify all **5 fundamental system properties** in real time:

1. **Linearity** (Linear vs Non-linear)
2. **Causality** (Causal vs Non-causal)
3. **BIBO Stability** (Stable vs Unstable)
4. **Time Invariance** (Time-Invariant vs Time-Variant)
5. **Static / Dynamic** (Memoryless vs With Memory)

---

## 🚀 Live Demo & Local Execution

This project is a **pure frontend web application** (HTML5, CSS3, JavaScript ES6+), running completely in the browser with **zero backend servers, databases, or API keys required**.

### Running Locally
1. Clone or download this repository.
2. Open `index.html` directly in any web browser (Chrome, Edge, Firefox, Safari).
3. Alternatively, run the included Node.js server:
   ```bash
   node server.js
   ```
   and navigate to `http://localhost:5173`.

---

## 🔬 Core Laboratory Features

### 1. Dual Oscilloscope Display
- **CH 1: Input Signal $x(t)$**
- **CH 2: System Output $y(t) = T\{x(t)\}$**
- Real-time amplitude and peak tracking with responsive interactive Plotly waveforms.

### 2. Predefined & Custom Input Signals
- **Predefined Library**: Sine, Cosine, Unit Step $u(t)$, Ramp $r(t)$, Unit Impulse $\delta(t)$, Exponential $e^{-at}u(t)$, Square Wave, Triangular Wave, and Rectangular Pulse.
- **Custom Signal Expression**: Type any mathematical expression, e.g.:
  - $x(t) = \sin(t)$
  - $x(t) = e^{-t} \cdot u(t)$
  - $x(t) = t$
  - $x(t) = \cos(2t)$
  - $x(t) = r(t - 1)$
  with live mini-waveform preview before launching experiments.

### 3. Predefined & Custom Systems
- **12 Canonical Systems**:
  1. Linear Scaling: $y(t) = 2x(t)$
  2. Squaring System: $y(t) = x^2(t)$
  3. Time Delay: $y(t) = x(t - 1)$
  4. Time Advance: $y(t) = x(t + 1)$
  5. Time Multiplier: $y(t) = t \cdot x(t)$
  6. Differentiator: $y(t) = \frac{dx(t)}{dt}$
  7. Ideal Integrator: $y(t) = \int_{-\infty}^t x(\tau) d\tau$
  8. Absolute Value (Rectifier): $y(t) = |x(t)|$
  9. Time Scaling (Compression): $y(t) = x(2t)$
  10. Time Reversal (Inversion): $y(t) = x(-t)$
  11. Affine Scaling: $y(t) = 2x(t) + 3$
  12. Exponential Operator: $y(t) = e^{x(t)}$
- **Custom System Parser**: Type any custom system equation:
  - $y(t) = 3x(t)$
  - $y(t) = x(t)^2 + 1$
  - $y(t) = x(t - 2)$
  - $y(t) = t \cdot x(t)$
  - $y(t) = \text{diff}(x(t))$
  - $y(t) = \text{integral}(x(t))$
  The engine automatically analyzes, simulates, and verifies all 5 properties!

### 4. 5-Property Summary Dashboard
Displays a color-coded executive summary across all 5 properties with one-click access to detailed proofs:
| System Property | Classification | Educational Explanation |
| :--- | :--- | :--- |
| **Linearity** | Linear / Non-linear | Verifies superposition $T\{a x_1 + b x_2\} = a T\{x_1\} + b T\{x_2\}$ |
| **Causality** | Causal / Non-causal | Tests if output depends only on present and past inputs ($\tau \le t$) |
| **BIBO Stability** | Stable / Unstable | Checks if every bounded input produces a bounded output |
| **Time Invariance** | Time-Invariant / Time-Variant | Compares response to shifted input vs delayed output |
| **Static / Dynamic** | Static / Dynamic | Memory probe verifies whether system depends on past/future states |

### 5. Detailed Step-by-Step Mathematical Verification
Clicking on any property card reveals:
- The exact mathematical condition and algebraic derivation rendered in **KaTeX**.
- Numerical tolerance metrics ($\epsilon_{\max} \le 10^{-4}$).
- Pedagogical ECE reasoning explaining why the result was obtained.
- Specialized comparison oscilloscopes (LHS vs RHS Superposition, Delay vs Shift, Causality disturbance probe, Memory probe test).

### 6. Practice & Quiz Mode (Interactive Assessment)
- Generates system equations and prompts students to predict all 5 properties.
- **Check Answer** provides immediate scoring (e.g. 5/5 ⭐), color-coded feedback, and detailed academic reasons.
- **Load in Lab Workbench** button allows students to immediately test and verify quiz equations with live waveforms.

---

## 📂 Project Structure

```text
VR_LAB/
├── index.html                           # Main web application entrypoint
├── css/
│   └── style.css                        # Modern dark cyber-lab UI & responsive styles
├── js/
│   ├── utils.js                         # Numerical utilities & expression compilers
│   ├── signals.js                       # 9 signal generators & custom expression support
│   ├── systems.js                       # 12 canonical systems & custom system parser
│   ├── plots.js                         # Plotly.js oscilloscopes & comparison graphs
│   ├── linearity.js                     # Superposition LHS vs RHS verification engine
│   ├── timeInvariance.js                # Time-shift commutativity verification engine
│   ├── causality.js                     # Temporal perturbation & probe verification engine
│   ├── stability.js                     # BIBO bound tracking & envelope divergence engine
│   ├── staticDynamic.js                 # Memoryless vs with-memory probe verification engine
│   ├── practice.js                      # Quiz & prediction challenge engine
│   └── app.js                           # Central UI controller & application logic
├── server.js                            # Lightweight static dev server
└── README.md                            # Comprehensive documentation
```

---

## 📜 Educational Pedagogy: Learn → Experiment → Visualize → Verify → Understand

Instead of memorizing static tables, students:
1. **Configure** an input signal and mathematical system.
2. **Observe** continuous-time waveforms on calibrated dual oscilloscopes.
3. **Verify** all 5 properties empirically against numerical thresholds.
4. **Inspect** mathematical derivations and algebraic proofs.
5. **Test** their intuition in the Practice Challenge mode.
