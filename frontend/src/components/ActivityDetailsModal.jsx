import { X, Calendar, MapPin, Clock } from 'lucide-react';

const ActivityDetailsModal = ({ activity, onClose }) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{activity.title} - Activities</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">About</h3>
            <p className="text-gray-600">{activity.description}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">Scheduled Activities</h3>
            {activity.activities && activity.activities.length > 0 ? (
              <div className="space-y-3">
                {activity.activities.map((act, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h4 className="font-medium mb-2">{act.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{act.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {act.date && (
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>{new Date(act.date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {act.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{act.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No activities scheduled yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
