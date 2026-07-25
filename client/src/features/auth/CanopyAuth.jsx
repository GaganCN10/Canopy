import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from './authSlice';
import { login } from './authApi';
import { register } from './authApi';
import { useToast } from '../../components/Toast';
import { getErrorMessage } from '../../utils/errors';

const API_BASE = "/api/auth";

function LeafIcon({ filled = true, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={`leaf-icon ${filled ? "is-filled" : "is-empty"} ${className}`} aria-hidden="true">
      <path d="M20 4C11 4 4 11 4 20c0 0 9-1 13-5s3-11 3-11z" />
      <path d="M6 18C10 14 14 10 19 5" className="leaf-vein" />
    </svg>
  );
}

function PasswordStrength({ password }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["Bare soil", "Sprouting", "Taking root", "Growing strong", "Full canopy"];

  return (
    <div className="strength-row" aria-live="polite">
      <div className="strength-leaves">
        {[0, 1, 2, 3].map((i) => (
          <LeafIcon key={i} filled={i < score} />
        ))}
      </div>
      <span className="strength-label">{password ? labels[score] : "Password strength"}</span>
    </div>
  );
}

function Field({ id, label, type = "text", value, onChange, error, right, ...rest }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <div className="field-control">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          {...rest}
        />
        <label htmlFor={id}>{label}</label>
        {right && <div className="field-right">{right}</div>}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default function CanopyAuth() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverNotice, setServerNotice] = useState("");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: false,
    terms: false,
  });

  const sceneRef = useRef(null);
  const reduceMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    if (reduceMotion.current) return;
    const el = sceneRef.current;
    if (!el) return;

    function handleMove(e) {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      el.style.setProperty("--parallax-x", x.toFixed(3));
      el.style.setProperty("--parallax-y", y.toFixed(3));
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  function update(field) {
    return (e) => {
      const value = field === "remember" || field === "terms" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((er) => ({ ...er, [field]: null }));
    };
  }

  function validate() {
    const next = {};
    if (mode === "register" && form.name.trim().length < 2) {
      next.name = "Enter your full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }
    if (form.password.length < 8) {
      next.password = "Use at least 8 characters.";
    }
    if (mode === "register" && form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords don't match.";
    }
    if (mode === "register" && !form.terms) {
      next.terms = "You need to accept the terms to continue.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setServerNotice("");
    if (!validate()) return;

    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await login(form.email, form.password);
      } else {
        const nameParts = form.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        result = await register({
          firstName,
          lastName,
          email: form.email,
          password: form.password,
        });
      }

      dispatch(setCredentials(result.data));
      showSuccess(
        mode === "login" ? "Welcome back" : "Account created",
        mode === "login" ? "Redirecting you into the canopy." : "Your conservation journey starts now."
      );
      navigate('/');
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      setServerError(errorInfo.message || "Something went wrong. Try again.");
      showError(errorInfo.title, errorInfo.message, errorInfo.remedy);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    setServerError("");
    setServerNotice("");
  }

  return (
    <div className="canopy-auth" ref={sceneRef}>
      <style>{CANOPY_AUTH_CSS}</style>

      <div className="ambient-scene" aria-hidden="true">
        <div className="ambient-layer layer-far">
          <img
            data-placeholder="true"
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80"
            alt=""
          />
        </div>
        <div className="ambient-layer layer-mid">
          <img
            data-placeholder="true"
            src="https://images.unsplash.com/photo-1511497584788-876760111969?w=1600&q=80"
            alt=""
          />
        </div>
        <div className="ambient-layer layer-near">
          <img
            data-placeholder="true"
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&q=80"
            alt=""
          />
        </div>
        <div className="light-shaft" />
      </div>

      <main className="specimen-card" role="main">
        <div className="card-glow" aria-hidden="true" />

        <div className="leaf-tabs" role="tablist" aria-label="Choose sign in or register">
          <button
            role="tab"
            aria-selected={mode === "login"}
            className={`leaf-tab tab-login ${mode === "login" ? "is-active" : ""}`}
            onClick={() => switchMode("login")}
            type="button"
          >
            <LeafIcon filled className="tab-leaf" />
            Sign in
          </button>
          <button
            role="tab"
            aria-selected={mode === "register"}
            className={`leaf-tab tab-register ${mode === "register" ? "is-active" : ""}`}
            onClick={() => switchMode("register")}
            type="button"
          >
            <LeafIcon filled className="tab-leaf" />
            Join
          </button>
        </div>

        <header className="card-header">
          <h1 className="wordmark">Sign in</h1>
          <p className="tagline" key={mode}>
            {mode === "login"
              ? "Access your conservation workspace."
              : "Create your account to get started."}
          </p>
        </header>

        <form className="auth-form" key={mode} onSubmit={handleSubmit} noValidate>
          {mode === "register" && (
            <Field
              id="name"
              label="Full name"
              value={form.name}
              onChange={update("name")}
              error={errors.name}
              autoComplete="name"
            />
          )}

          <Field
            id="email"
            label="Email address"
            type="email"
            value={form.email}
            onChange={update("email")}
            error={errors.email}
            autoComplete="email"
          />

          <div className="field">
            <div className="field-control">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update("password")}
                placeholder=" "
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <label htmlFor="password">Password</label>
              <div className="field-right">
                <button
                  type="button"
                  className="ghost-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
            {mode === "register" && <PasswordStrength password={form.password} />}
          </div>

          {mode === "register" && (
            <Field
              id="confirmPassword"
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          )}

          <div className="row-between">
            {mode === "login" ? (
              <>
                <label className="checkbox">
                  <input type="checkbox" checked={form.remember} onChange={update("remember")} />
                  <span className="checkbox-mark" aria-hidden="true" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-link">
                  Forgot password?
                </Link>
              </>
            ) : (
              <label className={`checkbox ${errors.terms ? "has-error" : ""}`}>
                <input type="checkbox" checked={form.terms} onChange={update("terms")} />
                <span className="checkbox-mark" aria-hidden="true" />
                I agree to the <Link to="/terms">terms</Link> and{" "}
                <Link to="/privacy">conservation data policy</Link>
              </label>
            )}
          </div>
          {errors.terms && <p className="field-error">{errors.terms}</p>}

          {serverError && (
            <p className="server-message is-error" role="alert">
              {serverError}
            </p>
          )}
          {serverNotice && (
            <p className="server-message is-success" role="status">
              {serverNotice}
            </p>
          )}

          <button className="primary-btn" type="submit" disabled={loading}>
            <span className={loading ? "btn-label is-loading" : "btn-label"}>
              {loading ? "" : mode === "login" ? "Sign in" : "Create account"}
            </span>
            {loading && <span className="spinner" aria-hidden="true" />}
          </button>
        </form>

        <p className="switch-line">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button type="button" className="text-link" onClick={() => switchMode("register")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" className="text-link" onClick={() => switchMode("login")}>
                Sign in
              </button>
            </>
          )}
        </p>
      </main>
    </div>
  );
}

const CANOPY_AUTH_CSS = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Work+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap");

.canopy-auth {
  --ink: #10201a;
  --ink-soft: #1b2e24;
  --ink-softer: #223c2c;
  --parchment: #f3ecd9;
  --parchment-dim: #cfc6ac;
  --moss: #7c9a6d;
  --moss-deep: #5a7850;
  --clay: #c1643c;
  --clay-soft: #d98b68;
  --fern-mist: #a9c3a0;
  --line: rgba(243, 236, 217, 0.14);

  --radius: 2px;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  --parallax-x: 0;
  --parallax-y: 0;

  position: relative;
  min-height: 100vh;
  width: 100%;
  background: var(--ink);
  color: var(--parchment);
  overflow: hidden;
  font-family: "Work Sans", system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6vh 8vw;
  box-sizing: border-box;
}

@media (prefers-reduced-motion: reduce) {
  .canopy-auth * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

.ambient-scene { position: absolute; inset: 0; z-index: 0; }

.ambient-layer {
  position: absolute;
  inset: -6%;
  will-change: transform;
  transition: transform 0.2s var(--ease);
}
.ambient-layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  filter: saturate(0.9);
}

.layer-far {
  filter: blur(3px);
  opacity: 0.55;
  transform: translate(calc(var(--parallax-x) * -6px), calc(var(--parallax-y) * -6px));
}
.layer-mid {
  opacity: 0.7;
  transform: translate(calc(var(--parallax-x) * -12px), calc(var(--parallax-y) * -10px));
}
.layer-near {
  opacity: 0.85;
  transform: translate(calc(var(--parallax-x) * -20px), calc(var(--parallax-y) * -16px));
  mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
}

.canopy-auth::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(
    ellipse 70% 60% at 78% 45%,
    rgba(16, 32, 26, 0.35) 0%,
    rgba(16, 32, 26, 0.85) 60%,
    rgba(16, 32, 26, 0.97) 100%
  );
  pointer-events: none;
}

.light-shaft {
  position: absolute;
  top: -10%;
  left: 30%;
  width: 40%;
  height: 130%;
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(243, 236, 217, 0.05) 40%,
    rgba(243, 236, 217, 0.09) 50%,
    transparent 65%
  );
  transform: rotate(8deg);
  z-index: 1;
  pointer-events: none;
}

.specimen-card {
  position: relative;
  z-index: 2;
  width: min(420px, 100%);
  background: var(--ink-soft);
  border: 1px solid var(--line);
  padding: 3.2rem 2.4rem 2.4rem;
  box-sizing: border-box;
  clip-path: polygon(
    0% 6%, 4% 2%, 9% 5%, 14% 1%, 19% 4%, 24% 0%, 29% 3%, 34% 1%, 39% 5%,
    44% 2%, 49% 4%, 54% 1%, 59% 5%, 64% 2%, 69% 4%, 74% 1%, 79% 5%,
    84% 2%, 89% 4%, 94% 1%, 100% 5%, 100% 100%, 0% 100%
  );
  animation: card-in 0.7s var(--ease) both;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  width: 260px;
  height: 260px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(124, 154, 109, 0.35) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}

.leaf-tabs { display: flex; justify-content: center; gap: 0.4rem; margin-bottom: 1.6rem; }

.leaf-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.3rem;
  font-family: "Space Mono", monospace;
  font-size: 0.88rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fern-mist);
  background: var(--ink-softer);
  border: 1px solid var(--line);
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.25s var(--ease), color 0.25s var(--ease), background 0.25s var(--ease);
}

.tab-login { transform: rotate(-3deg); }
.tab-register { transform: rotate(2deg); margin-left: -0.6rem; }

.leaf-tab .tab-leaf { width: 12px; height: 12px; opacity: 0.5; }

.leaf-tab.is-active {
  color: var(--ink);
  background: var(--moss);
  border-color: var(--moss);
  transform: rotate(0deg) translateY(-2px) scale(1.03);
  z-index: 2;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
}
.leaf-tab.is-active .tab-leaf { opacity: 1; }

.leaf-tab:focus-visible { outline: 2px solid var(--clay-soft); outline-offset: 2px; }

.card-header { text-align: center; margin-bottom: 1.8rem; }

.eyebrow {
  font-family: "Space Mono", monospace;
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fern-mist);
  margin: 0 0 0.6rem;
}

.wordmark {
  font-family: "Cormorant Garamond", serif;
  font-style: italic;
  font-weight: 600;
  font-size: 3.2rem;
  line-height: 1;
  margin: 0 0 0.5rem;
  color: var(--parchment);
}

.tagline { font-size: 1.15rem; color: var(--parchment-dim); margin: 0; animation: fade-in 0.4s var(--ease) both; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-form { display: flex; flex-direction: column; gap: 1.1rem; animation: fade-in 0.45s var(--ease) both; }

.field { display: flex; flex-direction: column; gap: 0.35rem; }

.field-control { position: relative; display: flex; align-items: center; }

.field-control input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--line);
  color: var(--parchment);
  font-family: "Work Sans", sans-serif;
  font-size: 1.15rem;
  padding: 1.1rem 0.1rem 0.5rem;
  box-sizing: border-box;
  transition: border-color 0.25s var(--ease);
}

.field-control input::placeholder { color: transparent; }

.field-control label {
  position: absolute;
  left: 0.1rem;
  top: 1.1rem;
  color: var(--parchment-dim);
  font-size: 1.05rem;
  pointer-events: none;
  transition: all 0.2s var(--ease);
}

.field-control input:focus,
.field-control input:not(:placeholder-shown) {
  outline: none;
  border-bottom-color: var(--moss);
}

.field-control input:focus ~ label,
.field-control input:not(:placeholder-shown) ~ label {
  top: -0.1rem;
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: "Space Mono", monospace;
  color: var(--fern-mist);
}

.field.has-error .field-control input { border-bottom-color: var(--clay); }

.field-right { position: absolute; right: 0; bottom: 0.6rem; }

.ghost-toggle {
  background: none;
  border: none;
  color: var(--fern-mist);
  font-family: "Space Mono", monospace;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0.2rem 0.3rem;
}
.ghost-toggle:hover { color: var(--parchment); }
.ghost-toggle:focus-visible { outline: 2px solid var(--clay-soft); }

.field-error {
  margin: 0;
  font-size: 0.92rem;
  color: var(--clay-soft);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  animation: shake-in 0.3s var(--ease);
}
.field-error::before { content: "⚠"; font-size: 0.7rem; }

@keyframes shake-in {
  0% { opacity: 0; transform: translateX(-4px); }
  50% { transform: translateX(3px); }
  100% { opacity: 1; transform: translateX(0); }
}

.strength-row { display: flex; align-items: center; gap: 0.6rem; margin-top: -0.4rem; }
.strength-leaves { display: flex; gap: 3px; }
.leaf-icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--parchment-dim);
  stroke-width: 1.5;
  transition: all 0.25s var(--ease);
}
.leaf-icon.is-filled { fill: var(--moss); stroke: var(--moss); }
.leaf-icon .leaf-vein { stroke: var(--ink-soft); stroke-width: 1; }
.leaf-icon.is-empty .leaf-vein { display: none; }
.strength-label { font-family: "Space Mono", monospace; font-size: 0.82rem; color: var(--fern-mist); letter-spacing: 0.03em; }

.row-between { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; font-size: 1rem; flex-wrap: wrap; }

.checkbox { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--parchment-dim); cursor: pointer; user-select: none; }
.checkbox input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.checkbox-mark {
  width: 15px;
  height: 15px;
  border: 1px solid var(--line);
  border-radius: 2px;
  display: inline-block;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s var(--ease);
}
.checkbox input:checked + .checkbox-mark { background: var(--moss); border-color: var(--moss); }
.checkbox input:checked + .checkbox-mark::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid var(--ink);
  border-width: 0 2px 2px 0;
  transform: rotate(40deg);
}
.checkbox input:focus-visible + .checkbox-mark { outline: 2px solid var(--clay-soft); outline-offset: 2px; }
.checkbox.has-error .checkbox-mark { border-color: var(--clay); }
.checkbox a { color: var(--fern-mist); }

.text-link {
  background: none;
  border: none;
  padding: 0;
  color: var(--fern-mist);
  font-size: 1rem;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.text-link:hover { color: var(--parchment); }
.text-link:focus-visible { outline: 2px solid var(--clay-soft); outline-offset: 2px; }

.server-message { margin: 0; font-size: 1rem; padding: 0.6rem 0.7rem; border-radius: 3px; border: 1px solid; }
.server-message.is-error { color: var(--clay-soft); border-color: rgba(193, 100, 60, 0.4); background: rgba(193, 100, 60, 0.08); }
.server-message.is-success { color: var(--fern-mist); border-color: rgba(124, 154, 109, 0.4); background: rgba(124, 154, 109, 0.08); }

.primary-btn {
  position: relative;
  border: none;
  background: linear-gradient(120deg, var(--moss), var(--moss-deep));
  color: var(--ink);
  font-family: "Work Sans", sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.02em;
  padding: 0.95rem 1rem;
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), background 0.4s var(--ease);
}
.primary-btn:hover { background: linear-gradient(120deg, #8caf7d, var(--moss)); box-shadow: 0 8px 20px rgba(124, 154, 109, 0.25); transform: translateY(-1px); }
.primary-btn:active { transform: translateY(0); }
.primary-btn:focus-visible { outline: 2px solid var(--clay-soft); outline-offset: 2px; }
.primary-btn:disabled { cursor: progress; opacity: 0.85; }

.btn-label.is-loading { opacity: 0; }
.spinner {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(16, 32, 26, 0.3);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.switch-line { text-align: center; font-size: 1.1rem; color: var(--parchment-dim); margin: 0; }

@media (max-width: 860px) {
  .canopy-auth { justify-content: center; padding: 5vh 6vw; align-items: flex-end; }
  .light-shaft { left: 10%; }
}

@media (max-width: 480px) {
  .specimen-card { padding: 2.6rem 1.4rem 2rem; width: 100%; }
  .wordmark { font-size: 2.6rem; }
  .leaf-tabs { gap: 0.2rem; }
}
`;
