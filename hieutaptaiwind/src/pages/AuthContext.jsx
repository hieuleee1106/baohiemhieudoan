import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("hieushop-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Xác thực token khi app load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("hieushop-token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? data);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Lỗi xác thực token:", err);
        logout();
      }
    };

    verifyUser();
  }, []);

  // Sync user với localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("hieushop-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hieushop-user");
    }
  }, [user]);

  const login = (userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem("hieushop-token", token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hieushop-token");
    toast.success("Đăng xuất thành công.");
  };

  const updateUser = (newUserData) => {
    const updated = newUserData.user ?? newUserData;
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const showNotification = (message, type = "success") => {
    type === "success"
      ? toast.success(message)
      : toast.error(message);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser, showNotification }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
