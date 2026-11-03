import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

const defaultSeeds = [
  { id: '1', name: "Vibin", email: "user@archifind.com", password: "user123", role: 'user' },
  { 
    id: '101', 
    name: "Arun Architect", 
    email: "pro@archifind.com", 
    password: "pro123", 
    role: 'professional',
    profession: "Architect",
    rating: 4.8,
    avatar: "https://i.pravatar.cc/150?u=1",
    portfolio: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"]
  },
  { id: '999', name: "Admin", email: "admin@archifind.com", password: "admin123", role: 'admin' }
];

export function DataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedUsers = localStorage.getItem('archifind_users');
    const storedMessages = localStorage.getItem('archifind_messages');
    
    if (!storedUsers) {
      localStorage.setItem('archifind_users', JSON.stringify(defaultSeeds));
      setUsers(defaultSeeds);
    } else {
      setUsers(JSON.parse(storedUsers));
    }
    
    if (!storedMessages) {
      setMessages([]);
    } else {
      setMessages(JSON.parse(storedMessages));
    }
    
    setIsLoaded(true);
  }, []);

  const registerUser = (newUser) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('archifind_users', JSON.stringify(updatedUsers));
  };
  
  const updateUser = (updatedUser) => {
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('archifind_users', JSON.stringify(updatedUsers));
  };

  const addMessage = (msg) => {
    const updatedMessages = [...messages, msg];
    setMessages(updatedMessages);
    localStorage.setItem('archifind_messages', JSON.stringify(updatedMessages));
  };

  if (!isLoaded) return null;

  return (
    <DataContext.Provider value={{ users, messages, registerUser, updateUser, addMessage }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
