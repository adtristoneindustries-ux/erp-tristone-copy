import { useState } from 'react';
import { Users, UserCheck, Shield } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StudentsTab from '../components/userManagement/StudentsTab';
import StaffTab from '../components/userManagement/StaffTab';
import RolesPermissionsTab from '../components/userManagement/RolesPermissionsTab';

const AdminUserManagement = () => {
  const [activeTab, setActiveTab] = useState('students');

  const tabs = [
    { id: 'students', label: 'Students', icon: Users },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage students, staff, and permissions</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-all ${
                    activeTab === id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm sm:text-base">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-all duration-300">
            {activeTab === 'students' && <StudentsTab />}
            {activeTab === 'staff' && <StaffTab />}
            {activeTab === 'roles' && <RolesPermissionsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
