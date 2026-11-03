import React from 'react';

const Professionals = () => {
  const professionals = [
    { name: 'Alex Thompson', profession: 'Architect', location: 'New York, NY', status: 'Active' },
    { name: 'Sarah Jenkins', profession: 'Interior Designer', location: 'Los Angeles, CA', status: 'Active' },
    { name: 'Michael Chen', profession: 'Structural Engineer', location: 'Chicago, IL', status: 'Pending' },
    { name: 'Emily Rodriguez', profession: 'Landscape Architect', location: 'Miami, FL', status: 'Active' },
    { name: 'David Wilson', profession: 'Architect', location: 'Seattle, WA', status: 'Inactive' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-[#111827]">Professionals</h2>
          <p className="text-slate-500 mt-1">Manage and verify professional accounts in the ArchiFind ecosystem.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0">
          Add New Professional
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1E293B] border-b border-[#334155]">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Profession</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {professionals.map((pro, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold border border-indigo-100 shadow-sm">
                      {pro.name.charAt(0)}
                    </div>
                    <span className="font-bold text-[#111827]">{pro.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-600 font-medium">{pro.profession}</td>
                <td className="px-6 py-5 text-slate-600 italic">{pro.location}</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    pro.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 
                    pro.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {pro.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right space-x-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors">Approve</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors">Reject</button>
                  <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors">Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Professionals;
