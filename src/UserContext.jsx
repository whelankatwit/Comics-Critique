// src/context/UserContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Create the provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Create a custom hook to use the context
export function useUser() {
  return useContext(UserContext);
}

export default UserContext; // Export UserContext as default
