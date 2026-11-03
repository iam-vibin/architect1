import React from 'react';
import { MdSend, MdAttachFile } from 'react-icons/md';

const Messages = () => {
  const chats = [
    { name: 'Alex Thompson', lastMsg: 'I have updated the floor plans.', time: '10:30 AM', active: true },
    { name: 'Sarah Jenkins', lastMsg: 'When is the next meeting?', time: 'Yesterday', active: false },
    { name: 'Michael Chen', lastMsg: 'The structural report is ready.', time: 'Mar 10', active: false },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-160px)] flex overflow-hidden">
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 italic text-gray-400">Search messages...</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat, index) => (
            <div key={index} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${chat.active ? 'bg-gray-50' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-gray-800">{chat.name}</h4>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.lastMsg}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#1abc9c] text-white flex items-center justify-center font-bold">A</div>
            <div>
              <h3 className="font-bold text-gray-800">Alex Thompson</h3>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
          <div className="flex flex-col items-end">
            <div className="bg-[#1abc9c] text-white p-3 rounded-2xl rounded-tr-none max-w-md shadow-sm">
              Hello Alex, did you check the latest feedback on the villa project?
            </div>
            <span className="text-[10px] text-gray-400 mt-1">10:25 AM</span>
          </div>
          
          <div className="flex flex-col items-start">
            <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-md shadow-sm border border-gray-100">
              Yes, I have updated the floor plans based on your comments. I'll upload them in a minute.
            </div>
            <span className="text-[10px] text-gray-400 mt-1">10:30 AM</span>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center space-x-4">
          <button className="text-gray-400 hover:text-gray-600"><MdAttachFile size={20} /></button>
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1abc9c]" 
          />
          <button className="bg-[#1abc9c] text-white p-2 rounded-full shadow-md hover:bg-[#16a085] transition-colors">
            <MdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
