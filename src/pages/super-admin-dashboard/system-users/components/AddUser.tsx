import { t } from 'i18next';
import { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import { useNavigate } from 'react-router-dom';
import 'react-international-phone/style.css';

export default function AddUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ userName, userEmail, phoneNumber, selectedRole });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <div className="col-span-1">
          <div>
            <label className="required mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.fullUserName')}
            </label>
            <input
              type="text"
              placeholder={t('rolesManagement.enterFullUserName')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-green-500 focus:ring focus:ring-green-100"
            />
          </div>
        </div>
        <div className="col-span-1">
          <div>
            <label className="required mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.phoneNumber')}
            </label>
            <div dir="ltr">
              <PhoneInput
                defaultCountry="eg"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value)}
                className="w-full"
                inputClassName="w-full rounded-md border border-gray-300 px-3 py-5 text-gray-700 focus:border-green-500 focus:ring focus:ring-green-100"
              />
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div>
            <label className="required mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.email')}
            </label>
            <input
              type="text"
              placeholder={t('rolesManagement.enterEmail')}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-green-500 focus:ring focus:ring-green-100"
            />
          </div>
        </div>
        <div className="col-span-1">
          <div>
            <label className="required mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.roleName')}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('rolesManagement.selectRole')}</option>
              <option value="1">مشرف عام</option>
              <option value="2">مشرف عام</option>
              <option value="3">مشرف عام</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-green-700 px-6 py-2 text-green-700 hover:bg-green-50"
          onClick={() => navigate(-1)}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
        >
          {t('common.add')}
        </button>
      </div>
    </form>
  );
}
