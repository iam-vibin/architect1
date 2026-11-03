import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar({ title = "ArchiFind", role = "user" }: { title?: string, role?: string }) {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b px-6 py-4 flex justify-between items-center"
    >
      <div className="flex items-center gap-3 text-2xl font-black tracking-tight text-primary">
        <LayoutDashboard className="w-7 h-7" />
        <Link to={`/${role}-dashboard`}>{title}</Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors relative">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-border hidden md:block"></div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right flex flex-col justify-center">
                <span className="text-sm font-bold text-foreground leading-none">{currentUser.name}</span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-primary mt-1">{currentUser.role}</span>
              </div>
              <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} alt="avatar" className="w-10 h-10 rounded-full shadow-sm border-2 border-white" />
            </div>
          )}
          <button 
            className="flex items-center justify-center p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors cursor-pointer" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button className="md:hidden p-2 text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
