import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "./LogoutButton";
import "./Navigation.css";

export default function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <header className="site-header">
      <NavLink className="site-brand" to="/">The Legend of Developer: The Blight of AI</NavLink>
      <nav className="site-links" aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/game">Game</NavLink>
        <Link className="debug-link" to="/game?mode=debug">Debug Lab</Link>
        {!user && <NavLink to="/login">Log In</NavLink>}
        {!user && <NavLink to="/signup">Sign Up</NavLink>}
        {user && <span className="player-name">{user.username}</span>}
        {user && <LogoutButton />}
      </nav>
    </header>
  );
}
