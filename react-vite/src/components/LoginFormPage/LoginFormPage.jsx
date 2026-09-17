import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../AuthForm.css";

function LoginFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/game" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email,
        password,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/game");
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="auth-kicker">RETURN TO EVERDAWN</p>
        <h1 id="login-title">Log In</h1>
        <p className="auth-copy">
          Continue a cloud-synced adventure on this device. Guest play remains
          available without an account.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {Array.isArray(errors) && errors.map((message) => (
            <p className="auth-error" key={message}>{message}</p>
          ))}
          <label className="auth-field">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {errors.email && <p className="auth-error">{errors.email}</p>}
          <label className="auth-field">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {errors.password && <p className="auth-error">{errors.password}</p>}
          {errors.server && <p className="auth-error">{errors.server}</p>}
          <button className="auth-submit" type="submit">Continue Adventure</button>
        </form>
        <div className="auth-links">
          <Link to="/game">Play as Guest</Link>
          <Link to="/signup">Create Account</Link>
          <Link to="/">Back to Title</Link>
        </div>
      </section>
    </main>
  );
}

export default LoginFormPage;
