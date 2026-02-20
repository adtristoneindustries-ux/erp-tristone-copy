import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, title, actions }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300 min-w-0">
        <Navbar />
        <div className="p-4 lg:p-6 overflow-hidden">
          {title && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">
              <h1 className="text-xl lg:text-2xl font-bold">{title}</h1>
              {actions && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {actions}
                </div>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
