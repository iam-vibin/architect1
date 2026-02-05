import { useNavigate } from "react-router-dom";

export function ProfessionalCard({ professional }) {
  const navigate = useNavigate();

  return (
    <div>
      {/* existing UI */}

      <button
        onClick={() => navigate(`/chat/${professional.id}`)}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        Message
      </button>
    </div>
  );
}
