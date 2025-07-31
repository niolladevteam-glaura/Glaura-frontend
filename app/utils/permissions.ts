import { ALL_PRIVILEGES } from "../constants/privilages";

interface Privilege {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const transformPermissions = (apiPermissions: Record<string, any>): string[] => {
  if (!apiPermissions) return [];
  
  return ALL_PRIVILEGES
    .filter(privilege => apiPermissions[privilege.id] === 1 || apiPermissions[privilege.id] === true)
    .map(privilege => privilege.id);
};

export const getPrivilegeDetails = (permissionId: string): Privilege => {
  return ALL_PRIVILEGES.find(p => p.id === permissionId) || {
    id: permissionId,
    name: permissionId.replace(/_/g, ' '),
    description: '',
    category: 'Other'
  };
};

export const preparePermissionsForApi = (permissionIds: string[]): Record<string, number> => {
  return ALL_PRIVILEGES.reduce((acc, privilege) => {
    acc[privilege.id] = permissionIds.includes(privilege.id) ? 1 : 0;
    return acc;
  }, {} as Record<string, number>);
};