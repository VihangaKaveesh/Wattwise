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

        if (!decoded.role) {
          // Fetch role if missing
          axios
            .get(`http://localhost:5000/api/users/${decoded.id || decoded._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              setUser({
                token,
                role: res.data.role,
                userId: decoded.id || decoded._id,
              });
            })
            .catch((err) => {
              console.error("Failed to fetch role:", err);
              setUser({
                token,
                role: "user",
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
    if (!token) return;
    localStorage.setItem("token", token);

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));

      if (!decoded.role) {
        const res = await axios.get(
          `http://localhost:5000/api/users/${decoded.id || decoded._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser({
          token,
          role: res.data.role,
          userId: decoded.id || decoded._id,
        });
      } else {
        setUser({
          token,
          role: decoded.role,
          userId: decoded.id || decoded._id,
        });
      }
    } catch (err) {
      console.error("Login token decoding failed:", err);
      localStorage.removeItem("token");
      setUser(null);
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
