import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./LandingPage.css";

export default function LandingPage() {
  const user = useSelector((state) => state.session.user);
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="game-title">
        <p className="landing-kicker">A CODE-FORGED ACTION ADVENTURE</p>
        <h1 id="game-title">The Legend of Developer: The Blight of AI</h1>
        <p className="landing-lede">
          The Blight of AI has spread across Everdawn. Begin in Willowbrook,
          claim the HTML Sword, master developer-forged tools, recover the
          Grove, Ember, and Crystal Sigils, and defeat the corrupted guardians
          sealing the realm.
        </p>
        <div className="landing-actions">
          <Link to="/game">Play Now</Link>
          {!user && <Link className="secondary" to="/signup">Create Account</Link>}
        </div>
        <div className="landing-highlights" aria-label="Game highlights">
          <span>Explore Everdawn</span>
          <span>Three Handcrafted Dungeons</span>
          <span>Adaptive Original Score</span>
          <span>Guest + Cloud Saves</span>
        </div>
        <small>
          {user
            ? "Your adventure is linked to your account, with a local fallback copy on this device."
            : "Play immediately as a guest, or create an account for cloud-synced saves."}
        </small>
      </section>
    </main>
  );
}
