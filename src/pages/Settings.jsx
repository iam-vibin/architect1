import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500">Manage your profile and account preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-sm flex items-center justify-center text-4xl text-gray-400 overflow-hidden">
            JD
          </div>
          <div>
            <button className="bg-[#1abc9c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#16a085] transition-colors">Change Photo</button>
            <p className="text-xs text-gray-400 mt-2">JPG or PNG. Max size of 800K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Full Name</label>
            <input type="text" className="w-full border border-gray-100 bg-gray-50 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#1abc9c] outline-none" defaultValue="John Doe Admin" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email Address</label>
            <input type="email" className="w-full border border-gray-100 bg-gray-50 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#1abc9c] outline-none" defaultValue="admin@archifind.com" />
          </div>
          <div className="space-y-2 text-gray-700">
            <label className="text-sm font-bold">Role</label>
            <div className="w-full bg-gray-100 rounded-lg px-4 py-2 text-gray-500">Super Administrator</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Language</label>
            <select className="w-full border border-gray-100 bg-gray-50 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#1abc9c] outline-none">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-50 flex justify-end space-x-4">
          <button className="px-6 py-2 border border-gray-100 rounded-lg font-medium text-gray-500 hover:bg-gray-50 transition-colors">Discard</button>
          <button className="px-6 py-2 bg-[#1abc9c] text-white rounded-lg font-bold shadow-md hover:bg-[#16a085] transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
