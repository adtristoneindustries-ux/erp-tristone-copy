const Card = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-xs lg:text-sm truncate">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">{value}</p>
      </div>
      <div className={`${colors[color]} p-3 lg:p-4 rounded-full flex-shrink-0 ml-2`}>
        <Icon size={24} className="text-white lg:w-8 lg:h-8" />
      </div>
    </div>
  );
};

export default Card;
