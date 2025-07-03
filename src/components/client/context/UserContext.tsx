import React, { createContext, useContext, useEffect, useState } from "react";

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface UserContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.id === "number") {
          setUser(parsed);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Dùng function declaration để fix lỗi HMR
export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
