import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from 'lucide-react';
import UnifiedNotifications from './UnifiedNotifications';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-white shadow-md px-2 sm:px-4 lg:px-6 py-3 sm:py-4 flex justify-between items-center relative z-30">
      <h2 className="text-sm sm:text-base lg:text-xl font-semibold text-gray-800 truncate ml-14 sm:ml-16 lg:ml-0">
        <span className="hidden sm:inline">Welcome, </span>
        <span className="sm:hidden">Hi, </span>
        {user?.name}
      </h2>
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        <UnifiedNotifications />
        
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="text-right">
            <p className="text-[10px] sm:text-xs lg:text-sm font-medium truncate max-w-[60px] sm:max-w-[80px] lg:max-w-none">{user?.name}</p>
            <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 truncate max-w-[60px] sm:max-w-[80px] lg:max-w-none">{user?.email}</p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;