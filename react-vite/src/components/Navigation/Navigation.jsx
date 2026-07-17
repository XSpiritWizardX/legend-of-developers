import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "./LogoutButton";
import "./Navigation.css";

export default function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <header className="site-header">
      <NavLink className="site-brand" to="/">Legend of Devs</NavLink>
      <nav className="site-links" aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/game">Game</NavLink>
        {!user && <NavLink to="/login">Log In</NavLink>}
        {!user && <NavLink to="/signup">Sign Up</NavLink>}
        {user && <span className="player-name">{user.username}</span>}
        {user && <LogoutButton />}
      </nav>
    </header>
  );
}
