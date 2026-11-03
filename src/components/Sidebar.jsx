import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdPeople, 
  MdGroup, 
  MdWork, 
  MdMessage, 
  MdSettings 
} from 'react-icons/md';

const Sidebar = ({ sidebarOpen }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <MdDashboard size={20} />, path: '/admin' },
    { name: 'Professionals', icon: <MdPeople size={20} />, path: '/admin/professionals' },
    { name: 'Users', icon: <MdGroup size={20} />, path: '/admin/users' },
    { name: 'Projects', icon: <MdWork size={20} />, path: '/admin/projects' },
    { name: 'Messages', icon: <MdMessage size={20} />, path: '/admin/messages' },
    { name: 'Settings', icon: <MdSettings size={20} />, path: '/admin/settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#0F172A] shadow-xl flex flex-col pt-6 border-r border-[#1E293B] transition-transform duration-300 z-50 transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="px-6 mb-8 flex items-center h-10">
        <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-indigo-500/20">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <h1 className="text-xl font-extrabold text-white whitespace-nowrap tracking-tight">
          Archi<span className="text-indigo-400">Admin</span>
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group gap-3 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-400 hover:bg-[#1E293B] hover:text-white'
              }`
            }
          >
            <span className="flex items-center justify-center transition-transform group-hover:scale-110">
              {item.icon}
            </span>
            <span className="font-medium whitespace-nowrap text-sm">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1E293B]">
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#1E293B] cursor-pointer transition-colors text-gray-400 hover:text-white">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">AD</div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">Admin User</p>
            <p className="text-[10px] truncate opacity-50">admin@archifind.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
