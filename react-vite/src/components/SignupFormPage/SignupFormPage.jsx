import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { thunkSignup } from "../../redux/session";
import "../AuthForm.css";

function SignupFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/game" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setErrors({
        confirmPassword: "Passwords must match before the adventure can be linked to your account.",
      });
    }

    const serverResponse = await dispatch(
      thunkSignup({
        email,
        username,
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
      <section className="auth-panel" aria-labelledby="signup-title">
        <p className="auth-kicker">CREATE YOUR ADVENTURER ACCOUNT</p>
        <h1 id="signup-title">Create Account</h1>
        <p className="auth-copy">
          Link your adventure to an account for cloud-synced saves while the
          game continues keeping a local fallback copy on this device.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {Array.isArray(errors) && errors.map((message) => (
            <p className="auth-error" key={message}>{message}</p>
          ))}
          {errors.server && <p className="auth-error">{errors.server}</p>}
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
            Username
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          {errors.username && <p className="auth-error">{errors.username}</p>}
          <label className="auth-field">
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {errors.password && <p className="auth-error">{errors.password}</p>}
          <label className="auth-field">
            Confirm Password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
          <button className="auth-submit" type="submit">Create Adventurer</button>
        </form>
        <div className="auth-links">
          <Link to="/game">Play as Guest</Link>
          <Link to="/login">Already Have an Account?</Link>
          <Link to="/">Back to Title</Link>
        </div>
      </section>
    </main>
  );
}

export default SignupFormPage;
