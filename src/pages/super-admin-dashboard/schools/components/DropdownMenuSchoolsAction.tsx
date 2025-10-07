import { useState } from 'react';
import dotsIcon from '@gradex/assets/icons/Dots.svg';

export default function DropdownMenuSchoolsAction() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
      >
        <img src={dotsIcon} alt="action" />
      </button>

      {open && (
        <div className="absolute left-0 z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-gray-700 hover:bg-gray-100">
            إرسال طلب تعديل
          </button>
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-green-600 hover:bg-green-50">
            قبول
          </button>
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-red-600 hover:bg-red-50">
            رفض
          </button>
        </div>
      )}
    </div>
  );
}
