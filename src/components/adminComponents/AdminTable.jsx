export default function AdminTable({ headers, children }) {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-sm border border-gray-200 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-2 text-[11px] font-bold bg-black text-gray-200 uppercase tracking-widest"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">{children}</tbody>
      </table>
    </div>
  );
}
