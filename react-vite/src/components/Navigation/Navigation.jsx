import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "./LogoutButton";
import "./Navigation.css";

export default function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <header className="site-header">
      <NavLink className="site-brand" to="/">The Legend of Developer</NavLink>
      <nav className="site-links" aria-label="Primary navigation">
        <NavLink to="/">Title</NavLink>
        <NavLink to="/game">Play</NavLink>
        {!user && <NavLink to="/login">Log In</NavLink>}
        {!user && <NavLink to="/signup">Create Account</NavLink>}
        {user && <span className="player-name">Adventurer: {user.username}</span>}
        {user && <LogoutButton />}
      </nav>
    </header>
  );
}
