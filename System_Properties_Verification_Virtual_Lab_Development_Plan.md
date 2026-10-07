# System Properties Verification Virtual Lab — Development Plan

## 1. Project Goal

Build an interactive, educational **System Properties Verification Virtual Lab** for a Signals and Systems practical.

The application should allow a student to select a mathematical system, provide an input signal, and experimentally verify:

1. Linearity
2. Time invariance
3. Causality
4. Stability

The lab must not simply display a pre-calculated answer. The student should actually perform a virtual experiment:

**Select System → Select Property → Provide Input → Run Test → Observe Outputs → Compare → Get Result → Understand Why**

---

## 2. Recommended Technology

Build this as a **frontend-only web application**.

### Required
- HTML5
- CSS3
- JavaScript ES6+

### Recommended libraries
- **Plotly.js** for interactive signal graphs.
- **Math.js** for mathematical calculations where useful.
- **KaTeX** or **MathJax** for equations.

Do not add a backend, database, login, authentication, or server-side API. The lab should run entirely in the browser and be deployable on **GitHub Pages**.

---

## 3. Main Concept

Represent a system as:

\[
y(t)=T\{x(t)\}
\]

where:
- \(x(t)\) = input signal
- \(T\) = system
- \(y(t)\) = output signal

The virtual lab should use this relationship throughout the interface.

---

## 4. Application Structure

```text
System Properties Verification Lab

├── Introduction
├── Virtual Experiment
│   ├── Linearity
│   ├── Time Invariance
│   ├── Causality
│   └── Stability
├── Learn
└── About
```

Main experiment layout:

```text
---------------------------------------------------------
       SYSTEM PROPERTIES VERIFICATION LAB
---------------------------------------------------------

Select System:
[ y(t) = 2x(t) ▼ ]

Select Property:
[ Linearity ▼ ]

Input Signal:
[ Sine wave ▼ ]

Parameters:
Amplitude: [ 1 ]
Frequency: [ 2 Hz ]

                 [ Run Test ]

---------------------------------------------------------
INPUT / OUTPUT
---------------------------------------------------------

Input x(t)
      graph

Output y(t)
      graph

---------------------------------------------------------
VERIFICATION
---------------------------------------------------------

Mathematical test:
...

Comparison:
...

Result:
✓ Linear

Explanation:
...
---------------------------------------------------------
```

---

## 5. Supported Systems

Use a controlled set of standard systems rather than arbitrary symbolic expressions.

### System 1 — Linear scaling

\[
y(t)=2x(t)
\]

Expected:
- Linear
- Time invariant
- Causal
- Stable

### System 2 — Squaring

\[
y(t)=x^2(t)
\]

Expected:
- Non-linear
- Time invariant
- Causal
- Stable for bounded inputs

### System 3 — Delay

\[
y(t)=x(t-2)
\]

Expected:
- Linear
- Time invariant
- Causal

### System 4 — Time-varying scaling

\[
y(t)=t\,x(t)
\]

Expected:
- Linear
- Time varying
- Causal

### System 5 — Absolute value

\[
y(t)=|x(t)|
\]

Expected:
- Non-linear
- Time invariant
- Causal

### System 6 — Differentiator

\[
y(t)=\frac{dx(t)}{dt}
\]

Expected:
- Linear
- Time invariant
- Causality/stability explanation must be handled carefully and mathematically.

### System 7 — Integrator

\[
y(t)=\int_{-\infty}^{t}x(\tau)d\tau
\]

Expected:
- Linear
- Time invariant
- Causal
- Not BIBO stable

### System 8 — Advance

\[
y(t)=x(t+2)
\]

Expected:
- Linear
- Time invariant
- Non-causal

Use these as predefined experiment choices.

---

## 6. Input Signal Library

Provide simple signals:

### Sine

\[
x(t)=A\sin(\omega t)
\]

### Cosine

\[
x(t)=A\cos(\omega t)
\]

### Exponential

\[
x(t)=Ae^{-at}
\]

### Step

\[
u(t)
\]

### Ramp

\[
r(t)=t\,u(t)
\]

Allow amplitude/frequency parameters where applicable.

---

## 7. Linearity Verification

The theoretical condition is:

\[
T\{a x_1(t)+b x_2(t)\}
=
aT\{x_1(t)\}+bT\{x_2(t)\}
\]

The interface should allow selection of:
- \(x_1(t)\)
- \(x_2(t)\)
- \(a\)
- \(b\)

Calculate:

### Left side

\[
T\{a x_1+b x_2\}
\]

### Right side

\[
aT\{x_1\}+bT\{x_2\}
\]

Show both graphs and a difference/error graph:

\[
Difference=LHS-RHS
\]

If the maximum difference is below a numerical tolerance:

**✓ System is Linear**

Otherwise:

**✗ System is Non-linear**

Display the numerical error.

Do not use exact floating-point equality.

---

## 8. Time-Invariance Verification

Use:

\[
T\{x(t-t_0)\}=y(t-t_0)
\]

Procedure:

1. Calculate \(y_1(t)=T\{x(t)\}\)
2. Create shifted input \(x(t-t_0)\)
3. Calculate \(y_2(t)=T\{x(t-t_0)\}\)
4. Compare with \(y_1(t-t_0)\)

Display:

```text
Original input x(t)
        ↓
     System
        ↓
Original output y(t)

Shifted input x(t-t₀)
        ↓
     System
        ↓
Output T{x(t-t₀)}

Compare with y(t-t₀)
```

If they match within tolerance:

**✓ Time Invariant**

Otherwise:

**✗ Time Varying**

Provide a control for \(t_0\).

---

## 9. Causality Verification

Explain:

> A causal system's output at the present time depends only on present and past input values, not future input values.

Examples:

### Causal

\[
y(t)=x(t)
\]

\[
y(t)=x(t-2)
\]

### Non-causal

\[
y(t)=x(t+2)
\]

For an advance system, demonstrate:

\[
y(0)=x(2)
\]

Therefore the output requires future input.

For a delay:

\[
y(0)=x(-2)
\]

Therefore only past input is required.

Use reliable predefined classifications rather than trying to infer causality from arbitrary user-written expressions.

---

## 10. Stability Verification

Use the BIBO definition:

> A system is BIBO stable if every bounded input produces a bounded output.

\[
|x(t)|\le M_x
\]

should result in:

\[
|y(t)|\le M_y
\]

for some finite \(M_y\).

Use bounded test signals such as sine waves.

For:

\[
y(t)=2x(t)
\]

the output remains bounded for bounded input.

For:

\[
y(t)=t x(t)
\]

a bounded non-decaying input can produce an unbounded output.

For the integrator:

\[
y(t)=\int_{-\infty}^{t}x(\tau)d\tau
\]

use a mathematically appropriate test and clearly explain the result.

Important: do not claim that a finite graph alone proves BIBO stability. Clearly distinguish a numerical demonstration from the theoretical classification.

---

## 11. Property Summary

For every selected system, show a summary:

```text
SYSTEM:
y(t) = 2x(t)

--------------------------------
Property          Result
--------------------------------
Linearity         ✓ Linear
Time Invariance   ✓ Time invariant
Causality         ✓ Causal
Stability         ✓ Stable
--------------------------------
```

The summary must be backed by the actual verification logic.

---

## 12. Guided Experiment Mode

Create a guided mode that behaves like a physical laboratory practical.

Example: **Verify Linearity**

### Step 1
Select system.

### Step 2
Select \(x_1(t)\) and \(x_2(t)\).

### Step 3
Choose \(a\) and \(b\).

### Step 4
Run experiment.

### Step 5
Compare LHS and RHS.

### Step 6
Display conclusion.

Progress indicator:

```text
1 Select → 2 Input → 3 Run → 4 Compare → 5 Result
```

---

## 13. Free Exploration Mode

Allow students to experiment without the guided sequence.

They should be able to change:
- system
- input signal
- parameters
- property

Include:
- Run
- Reset

---

## 14. Graph Requirements

Use Plotly.js.

Graphs should include:
- clear x-axis
- clear y-axis
- legend
- grid
- hover values
- zoom
- reset zoom

For comparisons, use separate graphs or clear overlays.

Do not overcrowd the graph.

---

## 15. Mathematical Verification Display

Whenever a property is tested, show the actual mathematical condition.

### Linearity

```text
LHS = T{a x₁ + b x₂}
RHS = aT{x₁} + bT{x₂}
Maximum error = ...
```

### Time invariance

```text
T{x(t-t₀)}
vs.
y(t-t₀)

Maximum error = ...
```

This connects the virtual experiment to classroom theory.

---

## 16. Tolerance Handling

Never compare floating-point arrays using exact equality.

Use a documented numerical tolerance, for example:

```text
abs(LHS - RHS) < tolerance
```

The implementation may use a suitable scale-aware tolerance.

Display the maximum error to the student.

---

## 17. Learning Panel

Include short expandable explanations.

### What is a system?

> A system takes an input signal and produces an output signal.

\[
y(t)=T\{x(t)\}
\]

### What is linearity?

> A linear system obeys superposition.

### What is time invariance?

> A time-invariant system behaves the same way when the input is shifted in time.

### What is causality?

> A causal system does not depend on future input values.

### What is stability?

> A BIBO-stable system produces a bounded output for every bounded input.

Keep the explanations short and student-friendly.

---

## 18. UI Design

The interface should be:

- simple
- modern
- academic
- clean
- interactive
- responsive
- mobile-friendly

Use:
- cards
- tabs
- dropdowns
- sliders
- clear result indicators

Avoid:
- excessive animation
- excessive colors
- large text blocks
- unexplained notation
- too many controls at once

A student should understand what to do without an external manual.

---

## 19. Suggested Page Layout

```text
-------------------------------------------------------
SYSTEM PROPERTIES VERIFICATION LAB
-------------------------------------------------------

[ Linearity ]
[ Time Invariance ]
[ Causality ]
[ Stability ]

-------------------------------------------------------
SYSTEM
[ y(t) = 2x(t) ▼ ]

INPUT SIGNAL
[ Sine ▼ ]

Amplitude:  [---●------]
Frequency:  [----●-----]

              [ RUN EXPERIMENT ]

-------------------------------------------------------
INPUT SIGNAL
             graph

OUTPUT SIGNAL
             graph

-------------------------------------------------------
VERIFICATION
             graph / comparison

Mathematical Test:
...

Maximum Error:
...

RESULT:
✓ System is Linear

WHY?
Short explanation...
-------------------------------------------------------
```

---

## 20. Data Architecture

Use structured system definitions.

Conceptually:

```javascript
{
    id: "scale",
    name: "y(t) = 2x(t)",
    operation: "scale",
    parameters: {
        gain: 2
    },
    expectedProperties: {
        linear: true,
        timeInvariant: true,
        causal: true,
        stable: true
    }
}
```

Do not rely only on text labels. Keep mathematical operations and UI labels separate.

---

## 21. Code Architecture

Recommended structure:

```text
system-properties-virtual-lab/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── systems.js
│   ├── signals.js
│   ├── linearity.js
│   ├── timeInvariance.js
│   ├── causality.js
│   ├── stability.js
│   ├── plots.js
│   └── utils.js
├── assets/
├── README.md
└── LICENSE
```

Keep mathematical/property logic separate from UI code.

---

## 22. No Backend

Do not create:
- database
- login
- authentication
- user accounts
- server-side API

Everything should run in the browser.

---

## 23. Deployment

The project must be compatible with GitHub Pages.

Development flow:

```text
VS Code
   ↓
HTML + CSS + JavaScript
   ↓
Test locally
   ↓
GitHub repository
   ↓
GitHub Pages
   ↓
Public Virtual Lab
```

Use relative paths for all assets.

---

## 24. Final Acceptance Checklist

### Functionality
- [ ] System selection works
- [ ] Signal selection works
- [ ] Parameter controls work
- [ ] Linearity experiment works
- [ ] Time-invariance experiment works
- [ ] Causality experiment works
- [ ] Stability experiment works
- [ ] Graphs update correctly
- [ ] Mathematical comparison is displayed
- [ ] Error/tolerance is handled
- [ ] Reset works
- [ ] Guided mode works
- [ ] Free exploration mode works
- [ ] Mobile layout works

### Mathematical correctness
- [ ] Linearity uses superposition
- [ ] Time invariance uses the correct shift relationship
- [ ] Causality classifications are mathematically correct
- [ ] Stability classifications are mathematically correct
- [ ] BIBO stability is not claimed solely from a finite simulation
- [ ] Any condition-dependent result is clearly labelled

### UI
- [ ] Beginner-friendly
- [ ] Graph labels are clear
- [ ] Equations are readable
- [ ] Results are easy to find
- [ ] No unnecessary clutter
- [ ] Interactive controls visibly respond
- [ ] Error messages are understandable

---

## 25. Important Development Instruction

Do NOT build this as a simple page that says:

> "System is linear."

The purpose is to create a **Virtual Lab**.

The student must be able to:

**select → provide input → run the test → observe outputs → compare → understand → conclude.**

Prioritize:

**Interactive Experiment + Visualization + Mathematical Verification + Explanation**

over simply displaying pre-calculated classifications.

Start with a small set of mathematically reliable systems and make the verification workflow excellent before adding more systems.
