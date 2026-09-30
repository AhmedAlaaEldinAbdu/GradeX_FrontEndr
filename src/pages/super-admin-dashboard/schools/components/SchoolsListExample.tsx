// /**
//  * Example: Schools List Component
//  * Demonstrates how to use the schools API with React hooks
//  */

// import { useState } from 'react';
// import { useSchools, useBulkSchoolOperations } from '../hooks/useSchoolsApi';

// export function SchoolsListExample() {
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState('');
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);

//   // Fetch schools using the hook
//   const { data, loading, error, refetch, total, totalPages } = useSchools({
//     page,
//     limit: 10,
//     search,
//   });

//   // Bulk operations hook
//   const { bulkDelete, loading: bulkLoading } = useBulkSchoolOperations();

//   // Handle search
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearch(e.target.value);
//     setPage(1); // Reset to first page
//   };

//   // Handle selection
//   const handleSelectSchool = (id: string) => {
//     setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
//   };

//   // Handle bulk delete
//   const handleBulkDelete = async () => {
//     if (selectedIds.length === 0) {
//       alert('Please select schools to delete');
//       return;
//     }

//     if (confirm(`Are you sure you want to delete ${selectedIds.length} schools?`)) {
//       try {
//         await bulkDelete(selectedIds);
//         setSelectedIds([]);
//         refetch(); // Refresh the list
//         alert('Schools deleted successfully');
//       } catch (err) {
//         alert('Failed to delete schools');
//         console.error(err);
//       }
//     }
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <div className="text-lg">Loading schools...</div>
//       </div>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <div className="rounded-sm border border-red-200 bg-red-50 p-4">
//         <h3 className="font-semibold text-red-800">Error Loading Schools</h3>
//         <p className="text-red-600">{error.message}</p>
//         <button
//           onClick={refetch}
//           className="mt-2 rounded-sm bg-red-600 px-4 py-2 text-white hover:bg-red-700"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="mb-4 text-2xl font-bold">Schools Management</h1>

//         {/* Search and Actions */}
//         <div className="flex items-center gap-4">
//           <input
//             type="text"
//             placeholder="Search schools..."
//             value={search}
//             onChange={handleSearch}
//             className="flex-1 rounded-sm border px-4 py-2"
//           />

//           {selectedIds.length > 0 && (
//             <button
//               onClick={handleBulkDelete}
//               disabled={bulkLoading}
//               className="rounded-sm bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
//             >
//               {bulkLoading ? 'Deleting...' : `Delete ${selectedIds.length} Selected`}
//             </button>
//           )}

//           <button
//             onClick={refetch}
//             className="rounded-sm bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Schools Table */}
//       <div className="overflow-hidden rounded-lg bg-white shadow-sm">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left">
//                 <input
//                   type="checkbox"
//                   checked={data.length > 0 && selectedIds.length === data.length}
//                   onChange={(e) => {
//                     if (e.target.checked) {
//                       setSelectedIds(data.map((s) => s.id));
//                     } else {
//                       setSelectedIds([]);
//                     }
//                   }}
//                 />
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
//                 Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
//                 Academic System
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
//                 Country
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 bg-white">
//             {data.map((school) => (
//               <tr key={school.id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.includes(school.id)}
//                     onChange={() => handleSelectSchool(school.id)}
//                   />
//                 </td>
//                 <td className="whitespace-nowrap px-6 py-4">
//                   <div className="font-medium text-gray-900">{school.name}</div>
//                 </td>
//                 <td className="whitespace-nowrap px-6 py-4">{school.academicSystem}</td>
//                 <td className="whitespace-nowrap px-6 py-4">{school.country}</td>
//                 <td className="whitespace-nowrap px-6 py-4">
//                   <span
//                     className={`rounded-full px-2 py-1 text-xs ${
//                       school.status === 'active'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-gray-100 text-gray-800'
//                     }`}
//                   >
//                     {school.status}
//                   </span>
//                 </td>
//                 <td className="whitespace-nowrap px-6 py-4 text-sm">
//                   <button className="mr-3 text-blue-600 hover:text-blue-800">Edit</button>
//                   <button className="text-red-600 hover:text-red-800">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="mt-6 flex items-center justify-between">
//         <div className="text-sm text-gray-700">
//           Showing {data.length} of {total} schools
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className="rounded-sm border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2">
//             Page {page} of {totalPages}
//           </span>
//           <button
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className="rounded-sm border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
