import { useState } from 'react';
import { Shield, Save, RotateCcw } from 'lucide-react';

const RolesPermissionsTab = () => {
  const [permissions, setPermissions] = useState({
    admin: {
      students: { create: true, read: true, update: true, delete: true },
      staff: { create: true, read: true, update: true, delete: true },
      subjects: { create: true, read: true, update: true, delete: true },
      classes: { create: true, read: true, update: true, delete: true },
      attendance: { create: true, read: true, update: true, delete: true },
      marks: { create: true, read: true, update: true, delete: true },
      materials: { create: true, read: true, update: true, delete: true },
      announcements: { create: true, read: true, update: true, delete: true },
      timetable: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true }
    },
    staff: {
      students: { create: false, read: true, update: false, delete: false },
      staff: { create: false, read: true, update: false, delete: false },
      subjects: { create: false, read: true, update: false, delete: false },
      classes: { create: false, read: true, update: false, delete: false },
      attendance: { create: true, read: true, update: true, delete: false },
      marks: { create: true, read: true, update: true, delete: false },
      materials: { create: true, read: true, update: true, delete: true },
      announcements: { create: true, read: true, update: false, delete: false },
      timetable: { create: false, read: true, update: false, delete: false },
      reports: { create: false, read: true, update: false, delete: false }
    },
    student: {
      students: { create: false, read: false, update: false, delete: false },
      staff: { create: false, read: false, update: false, delete: false },
      subjects: { create: false, read: true, update: false, delete: false },
      classes: { create: false, read: true, update: false, delete: false },
      attendance: { create: false, read: true, update: false, delete: false },
      marks: { create: false, read: true, update: false, delete: false },
      materials: { create: false, read: true, update: false, delete: false },
      announcements: { create: false, read: true, update: false, delete: false },
      timetable: { create: false, read: true, update: false, delete: false },
      reports: { create: false, read: true, update: false, delete: false }
    }
  });

  const [selectedRole, setSelectedRole] = useState('admin');

  const modules = [
    { key: 'students', label: 'Students Management' },
    { key: 'staff', label: 'Staff Management' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'classes', label: 'Classes' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'marks', label: 'Marks & Grades' },
    { key: 'materials', label: 'Study Materials' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'timetable', label: 'Timetable' },
    { key: 'reports', label: 'Reports' }
  ];

  const roles = [
    { key: 'admin', label: 'Admin', color: 'blue' },
    { key: 'staff', label: 'Staff', color: 'green' },
    { key: 'student', label: 'Student', color: 'purple' }
  ];

  const togglePermission = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: {
          ...prev[selectedRole][module],
          [action]: !prev[selectedRole][module][action]
        }
      }
    }));
  };

  const toggleAllForModule = (module, value) => {
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: {
          create: value,
          read: value,
          update: value,
          delete: value
        }
      }
    }));
  };

  const handleSave = () => {
    console.log('Saving permissions:', permissions);
    alert('Permissions saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all permissions to default?')) {
      window.location.reload();
    }
  };

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.key === role);
    return roleObj?.color || 'gray';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Shield size={24} />
            Roles & Permissions
          </h2>
          <p className="text-sm text-gray-600 mt-1">Configure access control for different user roles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={18} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      {/* Role Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Role</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {roles.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setSelectedRole(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole === key
                  ? `border-${color}-500 bg-${color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">{label}</span>
                {selectedRole === key && (
                  <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Create</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Read</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Update</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Delete</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">All</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modules.map(({ key, label }) => {
                const modulePerms = permissions[selectedRole][key];
                const allEnabled = Object.values(modulePerms).every(v => v);
                const noneEnabled = Object.values(modulePerms).every(v => !v);
                
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{label}</td>
                    {['create', 'read', 'update', 'delete'].map(action => (
                      <td key={action} className="px-4 py-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={modulePerms[action]}
                            onChange={() => togglePermission(key, action)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                        </label>
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleAllForModule(key, !allEnabled)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          allEnabled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : noneEnabled
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {allEnabled ? 'All' : noneEnabled ? 'None' : 'Some'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden mt-6 space-y-4">
        {modules.map(({ key, label }) => {
          const modulePerms = permissions[selectedRole][key];
          return (
            <div key={key} className="bg-white rounded-lg shadow-md p-4">
              <h4 className="font-semibold text-gray-800 mb-3">{label}</h4>
              <div className="grid grid-cols-2 gap-3">
                {['create', 'read', 'update', 'delete'].map(action => (
                  <label key={action} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modulePerms[action]}
                      onChange={() => togglePermission(key, action)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{action}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Permission Summary</h3>
        <p className="text-sm text-blue-800">
          Role: <span className="font-semibold capitalize">{selectedRole}</span> • 
          Total Modules: {modules.length} • 
          Full Access: {modules.filter(m => Object.values(permissions[selectedRole][m.key]).every(v => v)).length} • 
          No Access: {modules.filter(m => Object.values(permissions[selectedRole][m.key]).every(v => !v)).length}
        </p>
      </div>
    </div>
  );
};

export default RolesPermissionsTab;
