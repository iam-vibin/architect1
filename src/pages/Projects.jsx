import React from 'react';

const Projects = () => {
  const projects = [
    { title: 'Modern Sustainable Villa', category: 'Architecture', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' },
    { title: 'Neutral Tones Apartment', category: 'Interior', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80' },
    { title: 'Urban Garden Landscape', category: 'Landscape', image: 'https://images.unsplash.com/photo-1558904541-efa8c1915918?auto=format&fit=crop&w=400&q=80' },
    { title: 'Commercial Office Space', category: 'Design', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80' },
    { title: 'Rustic Cabin Retreat', category: 'Architecture', image: 'https://images.unsplash.com/photo-1449156001931-96342467a330?auto=format&fit=crop&w=400&q=80' },
    { title: 'Minimalist Tiny House', category: 'Small Space', image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          <p className="text-gray-500">Review and manage architectural projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="h-48 overflow-hidden relative">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-4 left-4">
                <span className="bg-[#1abc9c] text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                  {project.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 text-lg mb-2">{project.title}</h3>
              <div className="flex justify-between items-center mt-4">
                <button className="text-sm font-medium text-gray-500 hover:text-[#1abc9c]">Edit Details</button>
                <button className="text-sm font-bold text-[#1abc9c]">View Project</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
