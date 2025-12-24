export function getPermissions(): Set<string> {
  if (typeof window === "undefined") return new Set();

  const raw = localStorage.getItem("currentUser");
  if (!raw) return new Set();

  try {
    const user = JSON.parse(raw);
    return new Set((user.permissions || []).map((p: any) => p.key));
  } catch {
    return new Set();
  }
}

export function can(permission: string): boolean {
  return getPermissions().has(permission);
}

export function canAny(perms: string[]): boolean {
  const set = getPermissions();
  return perms.some(p => set.has(p));
}
