import React from 'react';
import { MdPeople, MdGroup, MdWork, MdMessage } from 'react-icons/md';

const Card = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
    <div className={`p-4 rounded-lg flex items-center justify-center ${color} bg-opacity-10`}>
      <span className={`text-2xl ${color.replace('bg-', 'text-')}`}>{icon}</span>
    </div>
    <div>
      <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">{title}</p>
      <h3 className="text-3xl font-bold text-[#111827] mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const stats = [
    { title: 'Total Users', value: '1,284', icon: <MdGroup />, color: 'bg-indigo-500' },
    { title: 'Total Professionals', value: '450', icon: <MdPeople />, color: 'bg-green-500' },
    { title: 'Total Projects', value: '85', icon: <MdWork />, color: 'bg-purple-500' },
    { title: 'Total Messages', value: '2,450', icon: <MdMessage />, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-extrabold text-[#111827]">Dashboard Overview</h2>
        <p className="text-slate-500 mt-2 text-lg">Detailed system analytics and recent activity logs.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <Card key={stat.title} {...stat} />
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-[#111827] mb-6">Recent Activity Monitor</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-slate-50 rounded-lg px-4 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                  i === 1 ? 'bg-indigo-500' : i === 2 ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  {i}
                </div>
                <div>
                  <p className="text-base font-bold text-[#111827]">Modern Villa Project Submission {i}</p>
                  <p className="text-sm text-slate-500">Submitted by Alex Thompson • 2 hours ago</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Pending Review</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
