// /**
//  * Example: Create School Form Component
//  * Demonstrates how to create a school using the API
//  */

// import { useState } from 'react';
// import { useCreateSchool } from '../hooks/useSchoolsApi';
// import { schoolsApi } from '@/services/api';
// import type { SchoolFormData } from '../types/school.types';
// import { initialSchoolFormData } from '../types/school.types';

// export function CreateSchoolExample() {
//   const [formData, setFormData] = useState<SchoolFormData>(initialSchoolFormData);
//   const { createSchool, loading, error } = useCreateSchool();

//   const handleChange = (field: keyof SchoolFormData, value: unknown) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       // Transform form data to API request format
//       const apiRequest = schoolsApi.transformSchoolFormToRequest(formData);

//       // Create school
//       const newSchool = await createSchool(apiRequest);

//       console.log('School created successfully:', newSchool);
//       alert('School created successfully!');

//       // Reset form
//       setFormData(initialSchoolFormData);

//       // Navigate to schools list or detail page
//       // navigate('/schools');
//     } catch (err) {
//       console.error('Failed to create school:', err);
//       alert('Failed to create school. Please try again.');
//     }
//   };

//   return (
//     <div className="mx-auto max-w-4xl p-6">
//       <h1 className="mb-6 text-2xl font-bold">Create New School</h1>

//       {error && (
//         <div className="mb-4 rounded border border-red-200 bg-red-50 p-4">
//           <p className="text-red-600">{error.message}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Basic Information */}
//         <div className="rounded-lg bg-white p-6 shadow">
//           <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">School Name *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.schoolName}
//                 onChange={(e) => handleChange('schoolName', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">
//                 Academic System *
//               </label>
//               <select
//                 required
//                 value={formData.academicSystem}
//                 onChange={(e) => handleChange('academicSystem', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select System</option>
//                 <option value="American">American</option>
//                 <option value="British">British</option>
//                 <option value="IB">International Baccalaureate</option>
//                 <option value="National">National</option>
//               </select>
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">
//                 Foundation Date *
//               </label>
//               <input
//                 type="date"
//                 required
//                 value={formData.foundationDate}
//                 onChange={(e) => handleChange('foundationDate', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">Country *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.country}
//                 onChange={(e) => handleChange('country', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="mt-4">
//             <label className="mb-1 block text-sm font-medium text-gray-700">About School</label>
//             <textarea
//               value={formData.aboutSchool}
//               onChange={(e) => handleChange('aboutSchool', e.target.value)}
//               rows={4}
//               className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {/* Contact Information */}
//         <div className="rounded-lg bg-white p-6 shadow">
//           <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
//               <input
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={(e) => handleChange('email', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number *</label>
//               <input
//                 type="tel"
//                 required
//                 value={formData.phoneNumber}
//                 onChange={(e) => handleChange('phoneNumber', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">Landline</label>
//               <input
//                 type="tel"
//                 value={formData.landline}
//                 onChange={(e) => handleChange('landline', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
//               <input
//                 type="url"
//                 value={formData.website}
//                 onChange={(e) => handleChange('website', e.target.value)}
//                 className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Facilities */}
//         <div className="rounded-lg bg-white p-6 shadow">
//           <h2 className="mb-4 text-xl font-semibold">Facilities</h2>

//           <div className="grid grid-cols-3 gap-4">
//             {Object.entries(formData.facilities).map(([key, value]) => (
//               <label key={key} className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={value}
//                   onChange={(e) =>
//                     handleChange('facilities', {
//                       ...formData.facilities,
//                       [key]: e.target.checked,
//                     })
//                   }
//                   className="h-4 w-4 text-blue-600"
//                 />
//                 <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex gap-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {loading ? 'Creating...' : 'Create School'}
//           </button>

//           <button
//             type="button"
//             onClick={() => setFormData(initialSchoolFormData)}
//             className="rounded border border-gray-300 px-6 py-2 hover:bg-gray-50"
//           >
//             Reset
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
