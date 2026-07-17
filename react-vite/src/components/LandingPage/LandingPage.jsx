import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./LandingPage.css";

export default function LandingPage() {
  const user = useSelector((state) => state.session.user);
  return (
    <main className="landing-page">
      <p className="landing-kicker">A TOP-DOWN FANTASY ADVENTURE</p>
      <h1>Legend of <span>Devs</span></h1>
      <p>
        Explore the vale, fight monsters, uncover the shrine key, and reclaim
        the Lost Ember in a compact adventure inspired by the 16-bit classics.
      </p>
      <div className="landing-actions">
        <Link to="/game">Play Now</Link>
        {!user && <Link className="secondary" to="/signup">Create Account</Link>}
      </div>
      <small>{user ? "Your progress saves to your account." : "Play as a guest or sign in for cloud saves."}</small>
    </main>
  );
}
