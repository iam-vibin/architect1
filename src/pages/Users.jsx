import React from 'react';

const Users = () => {
  const users = [
    { name: 'John Doe', email: 'john@example.com', projects: 3 },
    { name: 'Jane Smith', email: 'jane@example.com', projects: 1 },
    { name: 'Robert Johnson', email: 'robert@example.com', projects: 5 },
    { name: 'Alice Williams', email: 'alice@example.com', projects: 2 },
    { name: 'Chris Evans', email: 'chris@example.com', projects: 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-[#111827]">User Management</h2>
        <p className="text-slate-500 mt-1 text-lg">Directory of all registered client accounts.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1E293B] border-b border-[#334155]">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Client Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Email Address</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Active Projects</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5">
                  <span className="font-bold text-[#111827]">{user.name}</span>
                </td>
                <td className="px-6 py-5 text-slate-600">{user.email}</td>
                <td className="px-6 py-5">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 shadow-sm">
                    {user.projects} {user.projects === 1 ? 'Project' : 'Projects'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95">
                    View Activity
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
