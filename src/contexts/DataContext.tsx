import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount } from '../contexts/AuthContext';

export interface ChatMessage {
  id: string | number;
  senderId: string;
  receiverId: string;
  senderRole?: string;
  text: string;
  timestamp: string;
}

interface DataContextType {
  users: UserAccount[];
  messages: ChatMessage[];
  registerUser: (newUser: UserAccount) => void;
  updateUser: (updatedUser: UserAccount) => void;
  addMessage: (msg: ChatMessage) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSeeds: UserAccount[] = [
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

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

  const registerUser = (newUser: UserAccount) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('archifind_users', JSON.stringify(updatedUsers));
  };
  
  const updateUser = (updatedUser: UserAccount) => {
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('archifind_users', JSON.stringify(updatedUsers));
  };

  const addMessage = (msg: ChatMessage) => {
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
