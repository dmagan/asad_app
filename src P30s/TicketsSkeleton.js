const TicketsSkeleton = ({ isDarkMode }) => {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border animate-pulse ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-2 flex-1">
                <div className={`h-4 w-2/3 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className={`h-3 w-1/4 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
              </div>
              <div className={`h-6 w-20 rounded-full ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
            </div>
            <div className={`h-4 w-full rounded ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>
        ))}
      </div>
    );
  };
  
  export default TicketsSkeleton;