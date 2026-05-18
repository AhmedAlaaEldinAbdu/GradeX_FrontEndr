import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import { useToast } from '@/shared/context/ToastContext';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { useJobRoleValidations } from '@/validations/job-role-validations';
import ChevronDownIcon from '@/assets/icons/ChevronDown.svg';
import {
  MOCK_PERMISSION_GROUPS,
  type MockPermissionGroup,
  type PermissionAccess,
  type SelectedPermissionsMap,
} from '../data/mockPermissions';
import type { MockRole } from '../data/mockRoles';

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <img
    src={ChevronDownIcon}
    alt=""
    aria-hidden="true"
    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
  />
);

interface RoleCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  name: string;
  labelClassName?: string;
}

const RoleCheckbox = ({
  checked,
  onChange,
  label,
  name,
  labelClassName = 'text-sm font-normal text-[#646969]',
}: RoleCheckboxProps) => (
  <label dir="rtl" className="flex cursor-pointer items-center gap-3">
    <span className="relative flex h-6 w-6 items-center justify-center">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer h-6 w-6 appearance-none rounded-lg border border-[#DDE0E0] transition checked:border-green-700 checked:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <svg
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute hidden h-3.5 w-3.5 text-white peer-checked:block"
      >
        <path
          d="M11.5 3.5L5.25 10L2.5 7.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    <span className={labelClassName}>{label}</span>
  </label>
);

interface AccessRadioProps {
  name: string;
  value: PermissionAccess;
  current: PermissionAccess | null;
  label: string;
  disabled: boolean;
  onChange: (value: PermissionAccess) => void;
}

const AccessRadio = ({ name, value, current, label, disabled, onChange }: AccessRadioProps) => (
  <label
    dir="rtl"
    className={`flex items-center gap-2 ${
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    }`}
  >
    <span className="text-sm font-normal text-[#646969]">{label}</span>
    <span className="relative flex h-4 w-4 items-center justify-center">
      <input
        type="radio"
        name={name}
        checked={!disabled && current === value}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="peer h-4 w-4 appearance-none rounded-full border border-[#878F8F] checked:border-green-700 disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none absolute hidden h-2 w-2 rounded-full bg-green-700 peer-checked:block" />
    </span>
  </label>
);

interface JobRoleFormValues {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

interface JobRoleFormProps {
  mode: 'add' | 'edit';
  initialData?: MockRole;
}

export default function JobRoleForm({ mode, initialData }: JobRoleFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const scrollToFirstError = useScrollToFirstError<JobRoleFormValues>();
  const { nameArRules, nameEnRules, descriptionRules, validatePermissions } =
    useJobRoleValidations();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobRoleFormValues>({
    defaultValues: { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '' },
  });

  const [selectedPermissions, setSelectedPermissions] = useState<SelectedPermissionsMap>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    MOCK_PERMISSION_GROUPS.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  );
  const [permissionsError, setPermissionsError] = useState<string | undefined>();

  // Edit mode: prefill from the provided role. Replace with API data on integration.
  useEffect(() => {
    if (!initialData) return;
    reset({
      nameAr: initialData.name,
      nameEn: '',
      descriptionAr: initialData.description,
      descriptionEn: '',
    });
  }, [initialData, reset]);

  const allPermissionIds = MOCK_PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id));
  const isAllSelected = allPermissionIds.every((pid) => selectedPermissions[pid]);

  const clearPermissionsError = () => {
    if (permissionsError) setPermissionsError(undefined);
  };

  const togglePermission = (pid: string) => {
    clearPermissionsError();
    setSelectedPermissions((prev) => {
      const next = { ...prev };
      if (next[pid]) {
        delete next[pid];
      } else {
        next[pid] = { access: 'view' };
      }
      return next;
    });
  };

  const setPermissionAccess = (pid: string, access: PermissionAccess) => {
    setSelectedPermissions((prev) => ({ ...prev, [pid]: { access } }));
  };

  const setGroupAccessForAll = (group: MockPermissionGroup, access: PermissionAccess) => {
    setSelectedPermissions((prev) => {
      const next = { ...prev };
      group.permissions.forEach((p) => {
        if (next[p.id]) next[p.id] = { access };
      });
      return next;
    });
  };

  const isGroupFullyChecked = (group: MockPermissionGroup) =>
    group.permissions.every((p) => selectedPermissions[p.id]);

  const getGroupAccess = (group: MockPermissionGroup): PermissionAccess | null => {
    const accesses = group.permissions
      .map((p) => selectedPermissions[p.id]?.access)
      .filter((a): a is PermissionAccess => Boolean(a));
    if (accesses.length === 0) return null;
    return accesses.every((a) => a === accesses[0]) ? accesses[0] : null;
  };

  const toggleGroup = (group: MockPermissionGroup) => {
    clearPermissionsError();
    const allChecked = isGroupFullyChecked(group);
    setSelectedPermissions((prev) => {
      const next = { ...prev };
      group.permissions.forEach((p) => {
        if (allChecked) {
          delete next[p.id];
        } else if (!next[p.id]) {
          next[p.id] = { access: 'view' };
        }
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    clearPermissionsError();
    if (isAllSelected) {
      setSelectedPermissions({});
    } else {
      setSelectedPermissions(
        allPermissionIds.reduce<SelectedPermissionsMap>(
          (acc, pid) => ({ ...acc, [pid]: acc[pid] ?? { access: 'view' } }),
          {}
        )
      );
    }
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const onValid = () => {
    const permissionsResult = validatePermissions(Object.keys(selectedPermissions).length);
    if (permissionsResult !== true) {
      setPermissionsError(permissionsResult);
      scrollToFirstError({ permissions: { message: permissionsResult } });
      return;
    }

    // Dummy submit — wire to the backend on integration.
    showToast({
      message:
        mode === 'edit'
          ? 'rolesManagement.roleUpdatedSuccessfully'
          : 'rolesManagement.roleCreatedSuccessfully',
      type: 'success',
    });
    navigate('/settings/job-roles');
  };

  return (
    <form onSubmit={handleSubmit(onValid, scrollToFirstError)} className="flex flex-col gap-6">
      <Card padding="md" className="flex flex-col gap-8">
        {/* Name fields */}
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1">
            <FormField
              label={t('rolesManagement.roleNameAr')}
              required
              htmlFor="nameAr"
              name="nameAr"
              error={errors.nameAr?.message}
            >
              <Controller
                name="nameAr"
                control={control}
                rules={nameArRules}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nameAr"
                    type="text"
                    placeholder={t('rolesManagement.enterRoleNameAr')}
                  />
                )}
              />
            </FormField>
          </div>
          <div className="flex-1">
            <FormField
              label={t('rolesManagement.roleNameEn')}
              required
              htmlFor="nameEn"
              name="nameEn"
              error={errors.nameEn?.message}
            >
              <Controller
                name="nameEn"
                control={control}
                rules={nameEnRules}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nameEn"
                    type="text"
                    placeholder={t('rolesManagement.enterRoleNameEn')}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        {/* Description fields */}
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1">
            <FormField
              label={t('rolesManagement.roleDescriptionAr')}
              optional
              htmlFor="descriptionAr"
              name="descriptionAr"
              error={errors.descriptionAr?.message}
            >
              <Controller
                name="descriptionAr"
                control={control}
                rules={descriptionRules}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    id="descriptionAr"
                    placeholder={t('rolesManagement.enterText')}
                    rows={3}
                  />
                )}
              />
            </FormField>
          </div>
          <div className="flex-1">
            <FormField
              label={t('rolesManagement.roleDescriptionEn')}
              optional
              htmlFor="descriptionEn"
              name="descriptionEn"
              error={errors.descriptionEn?.message}
            >
              <Controller
                name="descriptionEn"
                control={control}
                rules={descriptionRules}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    id="descriptionEn"
                    placeholder={t('rolesManagement.enterText')}
                    rows={3}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        {/* Permissions */}
        <div className="flex flex-col gap-4" data-form-field="permissions">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-[#3A3A3A]">
              {t('rolesManagement.permissions')}
            </h3>
            <RoleCheckbox
              name="select-all"
              checked={isAllSelected}
              onChange={handleSelectAll}
              label={t('rolesManagement.selectAll')}
              labelClassName="text-base font-medium text-green-800"
            />
          </div>

          {permissionsError && (
            <p className="text-start text-sm text-red-500">{permissionsError}</p>
          )}

          <div className="flex flex-col gap-4">
            {MOCK_PERMISSION_GROUPS.map((group) => {
              const expanded = expandedGroups[group.id];
              return (
                <div
                  key={group.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#DDE0E0] p-4"
                >
                  {/* Group header */}
                  <div
                    className={`flex min-h-[60px] items-center justify-between gap-4 rounded-xl px-3 py-2 ${
                      expanded ? 'border border-[#E5FFF4] bg-[#EEFDF6]' : ''
                    }`}
                  >
                    <RoleCheckbox
                      name={group.id}
                      checked={isGroupFullyChecked(group)}
                      onChange={() => toggleGroup(group)}
                      label={group.name}
                      labelClassName="text-base font-normal text-[#0E1F1F]"
                    />
                    <div className="flex items-center gap-6">
                      {expanded && (
                        <>
                          <AccessRadio
                            name={`access-group-${group.id}`}
                            value="view"
                            current={getGroupAccess(group)}
                            label={t('rolesManagement.viewOnly')}
                            disabled={!isGroupFullyChecked(group)}
                            onChange={(v) => setGroupAccessForAll(group, v)}
                          />
                          <AccessRadio
                            name={`access-group-${group.id}`}
                            value="edit"
                            current={getGroupAccess(group)}
                            label={t('rolesManagement.edit')}
                            disabled={!isGroupFullyChecked(group)}
                            onChange={(v) => setGroupAccessForAll(group, v)}
                          />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleExpand(group.id)}
                        aria-label={group.name}
                        className="flex shrink-0 items-center justify-center"
                      >
                        <ChevronIcon expanded={expanded} />
                      </button>
                    </div>
                  </div>

                  {/* Permission rows */}
                  {expanded && (
                    <div className="flex flex-col gap-2">
                      {group.permissions.map((perm) => {
                        const selected = selectedPermissions[perm.id];
                        const isChecked = Boolean(selected);
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between gap-4 py-1"
                          >
                            <RoleCheckbox
                              name={perm.id}
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              label={perm.name}
                            />
                            <div className="flex items-center gap-6">
                              <AccessRadio
                                name={`access-${perm.id}`}
                                value="view"
                                current={selected?.access ?? 'view'}
                                label={t('rolesManagement.viewOnly')}
                                disabled={!isChecked}
                                onChange={(v) => setPermissionAccess(perm.id, v)}
                              />
                              <AccessRadio
                                name={`access-${perm.id}`}
                                value="edit"
                                current={selected?.access ?? 'view'}
                                label={t('rolesManagement.edit')}
                                disabled={!isChecked}
                                onChange={(v) => setPermissionAccess(perm.id, v)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/settings/job-roles')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="success">
            {mode === 'edit' ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </Card>
    </form>
  );
}
