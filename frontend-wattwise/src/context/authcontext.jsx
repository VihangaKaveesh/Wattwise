import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));

        // If role is missing in token, fetch it from API
        if (!decoded.role) {
          axios.get(`http://localhost:5000/api/users/${decoded.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => {
            setUser({
              token,
              role: res.data.role, // get role from server
              userId: decoded.id || decoded._id,
            });
          })
          .catch(err => {
            console.error("Failed to fetch user role:", err);
            setUser({
              token,
              role: "user", // fallback default
              userId: decoded.id || decoded._id,
            });
          });
        } else {
          setUser({
            token,
            role: decoded.role,
            userId: decoded.id || decoded._id,
          });
        }

      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    const decoded = JSON.parse(atob(token.split(".")[1]));

    // If role missing, fetch from API
    if (!decoded.role) {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({
          token,
          role: res.data.role,
          userId: decoded.id || decoded._id,
        });
      } catch (err) {
        console.error("Failed to fetch role on login:", err);
        setUser({
          token,
          role: "user", // fallback default
          userId: decoded.id || decoded._id,
        });
      }
    } else {
      setUser({
        token,
        role: decoded.role,
        userId: decoded.id || decoded._id,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
