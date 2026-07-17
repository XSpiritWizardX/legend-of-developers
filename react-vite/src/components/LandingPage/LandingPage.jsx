import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./LandingPage.css";

export default function LandingPage() {
  const user = useSelector((state) => state.session.user);
  return (
    <main className="landing-page">
      <p className="landing-kicker">A CYBERPUNK CODING ADVENTURE</p>
      <h1>Legend of <span>Devs</span></h1>
      <p>
        Begin with nothing but ambition. Explore Neon Stack City, hunt down the
        HTML Sword, wield CSS and JavaScript tech, defeat production bugs, and
        survive the final interview to earn your first developer job.
      </p>
      <div className="landing-actions">
        <Link to="/game">Play Now</Link>
        {!user && <Link className="secondary" to="/signup">Create Account</Link>}
      </div>
      <small>{user ? "Your progress saves to your account." : "Play as a guest or sign in for cloud saves."}</small>
    </main>
  );
}
