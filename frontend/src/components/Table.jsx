const Table = ({ columns, data = [], actions }) => {
  return (
    <table className="w-full bg-white min-w-[320px] sm:min-w-[500px]">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[60px] sm:min-w-[80px]">
              <div className="truncate">{col.header}</div>
            </th>
          ))}
          {actions && <th className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[60px] sm:min-w-[80px]">Actions</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} className="px-2 sm:px-4 py-6 sm:py-8 text-center text-gray-500 text-sm lg:text-base">
              No data available
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm text-gray-900 min-w-[60px] sm:min-w-[80px]">
                  <div className="break-words">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </div>
                </td>
              ))}
              {actions && (
                <td className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm min-w-[60px] sm:min-w-[80px]">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default Table;
