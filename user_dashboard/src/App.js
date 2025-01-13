import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <Login onLoginSuccess={setUser} />
      )}
    </div>
  );
};

export default App;