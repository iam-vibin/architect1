import portfolio1 from '@/assets/portfolio-1.jpg';
import portfolio2 from '@/assets/portfolio-2.jpg';
import portfolio3 from '@/assets/portfolio-3.jpg';
import portfolio4 from '@/assets/portfolio-4.jpg';

export interface Professional {
  id: string;
  name: string;
  profession: 'Architect' | 'Interior Designer' | 'Builder';
  experience: number;
  location: string;
  specialization: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  projectsCompleted: number;
  portfolio: PortfolioItem[];
  about: string;
}

export interface PortfolioItem {
  id: string;
  image: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProfessionals: number;
  pendingVerifications: number;
  activeChats: number;
}

export const professionals: Professional[] = [
  {
    id: 'prof-1',
    name: 'Arun Kumar',
    profession: 'Architect',
    experience: 8,
    location: 'Chennai',
    specialization: 'Residential & Commercial Architecture',
    avatar: portfolio1,
    isVerified: true,
    rating: 4.8,
    projectsCompleted: 45,
    about: 'Award-winning architect with expertise in sustainable design and modern architecture.',
    portfolio: [
      { id: 'p1-1', image: portfolio1, title: 'Modern House Exterior' },
      { id: 'p1-2', image: portfolio4, title: 'Apartment Elevation' },
      { id: 'p1-3', image: portfolio3, title: 'Office Layout Design' },
    ],
  },
  {
    id: 'prof-2',
    name: 'Priya Interior Studio',
    profession: 'Interior Designer',
    experience: 6,
    location: 'Coimbatore',
    specialization: 'Modular Kitchens & Living Spaces',
    avatar: portfolio2,
    isVerified: true,
    rating: 4.9,
    projectsCompleted: 62,
    about: 'Transforming spaces into beautiful, functional environments.',
    portfolio: [
      { id: 'p2-1', image: portfolio2, title: 'Modular Kitchen' },
      { id: 'p2-2', image: portfolio3, title: 'Living Room Interior' },
      { id: 'p2-3', image: portfolio3, title: 'Bedroom Interior' },
    ],
  },
  {
    id: 'prof-3',
    name: 'Ravi Builders',
    profession: 'Builder',
    experience: 10,
    location: 'Madurai',
    specialization: 'Turnkey Construction',
    avatar: portfolio4,
    isVerified: true,
    rating: 4.7,
    projectsCompleted: 28,
    about: 'Delivering quality construction with attention to detail.',
    portfolio: [
      { id: 'p3-1', image: portfolio4, title: 'Apartment Project' },
      { id: 'p3-2', image: portfolio1, title: 'Completed Building' },
      { id: 'p3-3', image: portfolio4, title: 'Commercial Complex' },
    ],
  },
  {
    id: 'prof-4',
    name: 'Meera Designs',
    profession: 'Interior Designer',
    experience: 5,
    location: 'Trichy',
    specialization: 'Minimalist & Scandinavian Design',
    avatar: portfolio3,
    isVerified: false,
    rating: 4.6,
    projectsCompleted: 34,
    about: 'Creating serene, clutter-free spaces with natural materials.',
    portfolio: [
      { id: 'p4-1', image: portfolio3, title: 'Minimalist Living Room' },
      { id: 'p4-2', image: portfolio2, title: 'Scandinavian Bedroom' },
    ],
  },
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
  'prof-1': [
    { id: 'msg-1', senderId: 'user', receiverId: 'prof-1', message: 'Hi, I am interested in discussing a residential project.', timestamp: new Date(Date.now() - 3600000 * 2), isRead: true },
    { id: 'msg-2', senderId: 'prof-1', receiverId: 'user', message: 'Hello! I would love to hear more. What is the plot size?', timestamp: new Date(Date.now() - 3600000), isRead: true },
  ],
  'prof-2': [
    { id: 'msg-3', senderId: 'user', receiverId: 'prof-2', message: 'Hello! I need help designing my kitchen.', timestamp: new Date(Date.now() - 7200000), isRead: true },
    { id: 'msg-4', senderId: 'prof-2', receiverId: 'user', message: 'Hi! Could you share the kitchen dimensions?', timestamp: new Date(Date.now() - 5400000), isRead: false },
  ],
};

export const mockChatThreads: ChatThread[] = [
  { id: 'thread-1', participantId: 'prof-1', participantName: 'Arun Kumar', participantAvatar: portfolio1, lastMessage: 'What is the plot size?', lastMessageTime: new Date(Date.now() - 1800000), unreadCount: 0 },
  { id: 'thread-2', participantId: 'prof-2', participantName: 'Priya Interior Studio', participantAvatar: portfolio2, lastMessage: 'Could you share the kitchen dimensions?', lastMessageTime: new Date(Date.now() - 5400000), unreadCount: 1 },
];

export const adminStats: AdminStats = { totalUsers: 156, totalProfessionals: 23, pendingVerifications: 5, activeChats: 42 };

export const pendingVerifications = [
  { id: 'verify-1', professionalId: 'prof-4', name: 'Meera Designs', profession: 'Interior Designer', submittedAt: new Date(Date.now() - 86400000 * 2), documents: ['Business License', 'Portfolio', 'ID Proof'] },
  { id: 'verify-2', professionalId: 'prof-6', name: 'Kumar Constructions', profession: 'Builder', submittedAt: new Date(Date.now() - 86400000), documents: ['Registration Certificate', 'Past Projects', 'ID Proof'] },
];
