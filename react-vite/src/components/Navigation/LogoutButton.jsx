import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkLogout } from "../../redux/session";

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = async (e) => {
    e.preventDefault();
    await dispatch(thunkLogout());
    navigate("/");
  };

  return (
    <button className="logout-link" onClick={onLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
