"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
  Menu,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

interface Permission {
  id: string;
  key: string;
  description: string;
  module: string;
}

interface AccessLevel {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

function randomId() {
  return Math.random().toString(36).substr(2, 4).toUpperCase();
}

export default function AccessLevelManager() {
  // Permissions list from API
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permLoading, setPermLoading] = useState(true);

  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [accessLevelsLoading, setAccessLevelsLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingLevel, setEditingLevel] = useState<AccessLevel | null>(null);

  // Modal fields
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalPermissions, setModalPermissions] = useState<Permission[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch permission list (for modal creation) on mount
  useEffect(() => {
    async function fetchPermissions() {
      setPermLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "https://glaura-api.niolla-app.xyz/api/permission",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        if (res.status === 401) {
          setAllPermissions([]);
          setPermLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch permissions");
        const data = await res.json();
        if (data.success && Array.isArray(data.permissions)) {
          setAllPermissions(data.permissions);
        }
      } catch (error) {
        setAllPermissions([]);
      } finally {
        setPermLoading(false);
      }
    }
    fetchPermissions();
  }, []);

  // Fetch access levels from backend on mount and after any CRUD
  useEffect(() => {
    async function fetchAccessLevels() {
      setAccessLevelsLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE_URL}/permission/access-level`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) throw new Error("Failed to fetch access levels");
        const data = await res.json();
        if (data.success && Array.isArray(data.accessLevels)) {
          setAccessLevels(
            data.accessLevels.map((level: any) => ({
              id: level.id,
              name: level.name,
              description: level.description,
              permissions: Array.isArray(level.Permissions)
                ? level.Permissions.map((perm: any) => ({
                    id: perm.id,
                    key: perm.key,
                    description: perm.description,
                    module: perm.module,
                  }))
                : [],
            }))
          );
        } else {
          setAccessLevels([]);
        }
      } catch (e: any) {
        setAccessLevels([]);
      } finally {
        setAccessLevelsLoading(false);
      }
    }
    fetchAccessLevels();
  }, [API_BASE_URL]);

  // Filtered list (by search)
  const filteredAccessLevels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return accessLevels;
    return accessLevels.filter((level) => {
      const perms = level.permissions
        .map((p) => `${p.key} ${p.description} ${p.module}`)
        .join(" ")
        .toLowerCase();
      return (
        level.name.toLowerCase().includes(term) ||
        level.id.toLowerCase().includes(term) ||
        level.description.toLowerCase().includes(term) ||
        perms.includes(term)
      );
    });
  }, [search, accessLevels]);

  // Permission search in modal
  const filteredPermissions = useMemo(() => {
    const term = permissionSearch.trim().toLowerCase();
    if (!term) return allPermissions;
    return allPermissions.filter(
      (p) =>
        p.key.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.module.toLowerCase().includes(term)
    );
  }, [permissionSearch, allPermissions]);

  function openAddModal() {
    setShowModal(true);
    setModalMode("add");
    setModalName("");
    setModalDescription("");
    setModalPermissions([]);
    setPermissionSearch("");
    setEditingLevel(null);
  }

  function openEditModal(level: AccessLevel) {
    setShowModal(true);
    setModalMode("edit");
    setModalName(level.name);
    setModalDescription(level.description);
    setModalPermissions(level.permissions);
    setPermissionSearch("");
    setEditingLevel(level);
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalName.trim()) return;

    // Prepare permission IDs
    const permissionIds = modalPermissions.map((p) => p.id);

    if (modalMode === "add") {
      try {
        const response = await createAccessLevel({
          name: modalName,
          description: modalDescription,
          permissionIds,
        });

        if (!response.success) {
          toast.error(response.message || "API returned failure");
          return;
        }

        setShowModal(false);
        toast.success("Access Level created successfully!", {
          description: `Created "${response.accessLevel.name}" with ${modalPermissions.length} permissions.`,
          duration: 3500,
        });
        // Reload access levels list from backend
        reloadAccessLevels();
      } catch (err: any) {
        toast.error(err?.message || "Failed to create Access Level", {
          duration: 4000,
        });
      }
    } else if (modalMode === "edit" && editingLevel) {
      // TODO: Implement edit endpoint if available, otherwise just update local for demo
      setAccessLevels((prev) =>
        prev.map((al) =>
          al.id === editingLevel.id
            ? {
                ...al,
                name: modalName,
                description: modalDescription,
                permissions: modalPermissions,
              }
            : al
        )
      );
      setShowModal(false);
      toast.success("Access Level updated!", {
        description: `Updated "${modalName}".`,
        duration: 3000,
      });
      // You might want to refetch here from backend if edit is implemented server-side
      // reloadAccessLevels();
    }
  }

  // Refetch access levels from backend (after add/delete)
  async function reloadAccessLevels() {
    setAccessLevelsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/permission/access-level`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch access levels");
      const data = await res.json();
      if (data.success && Array.isArray(data.accessLevels)) {
        setAccessLevels(
          data.accessLevels.map((level: any) => ({
            id: level.id,
            name: level.name,
            description: level.description,
            permissions: Array.isArray(level.Permissions)
              ? level.Permissions.map((perm: any) => ({
                  id: perm.id,
                  key: perm.key,
                  description: perm.description,
                  module: perm.module,
                }))
              : [],
          }))
        );
      } else {
        setAccessLevels([]);
      }
    } catch (e: any) {
      setAccessLevels([]);
    } finally {
      setAccessLevelsLoading(false);
    }
  }

  function handleDelete(id: string) {
    // TODO: Replace this with a real API call to delete from server
    setAccessLevels((prev) => prev.filter((al) => al.id !== id));
    setDeleteId(null);
    // You should probably call reloadAccessLevels() if real delete implemented
  }

  // Permission toggle in modal
  function togglePermission(perm: Permission) {
    setModalPermissions((prev) =>
      prev.find((p) => p.id === perm.id)
        ? prev.filter((p) => p.id !== perm.id)
        : [...prev, perm]
    );
  }

  async function createAccessLevel({
    name,
    description,
    permissionIds,
  }: {
    name: string;
    description: string;
    permissionIds: string[];
  }) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/permission/access-level`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        access_level_name: name,
        description,
        permissions: permissionIds,
      }),
    });
    if (!res.ok) throw new Error("Failed to create access level");
    return await res.json();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Back Button */}
            <Link href="/dashboard" className="flex-shrink-0 hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center px-2 py-1 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
            </Link>

            {/* Page Title & Icon */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Access Level Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Groups and Permissions for Access Levels
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Access Level
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search access levels by name, ID, description, or permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-gray-50 dark:bg-gray-800"
                >
                  {filteredAccessLevels.length}{" "}
                  {filteredAccessLevels.length === 1 ? "Level" : "Levels"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Levels Grid */}
        {accessLevelsLoading ? (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              Loading access levels...
            </CardContent>
          </Card>
        ) : filteredAccessLevels.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
            <CardContent className="py-16 text-center">
              <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No access levels found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {search
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first access level"}
              </p>
              {!search && (
                <Button onClick={openAddModal} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Access Level
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAccessLevels.map((level) => (
              <Card
                key={level.id}
                className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-primary/20"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl font-semibold truncate">
                            {level.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            {level.id}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {level.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(level)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(level.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-5">
                    {/* Permissions Summary */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Permissions
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {level.permissions.length} permissions
                        </Badge>
                      </div>

                      {/* Permission Groups */}
                      <div className="space-y-4">
                        {Object.entries(
                          level.permissions.reduce<
                            Record<string, Permission[]>
                          >((groups, perm) => {
                            (groups[perm.module] =
                              groups[perm.module] || []).push(perm);
                            return groups;
                          }, {})
                        )
                          .slice(0, 2)
                          .map(([mod, perms]) => (
                            <div key={mod} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  {mod}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {perms.length} perms
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {perms.slice(0, 3).map((perm) => (
                                  <Badge
                                    key={perm.id}
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                  >
                                    {perm.description}
                                  </Badge>
                                ))}
                                {perms.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                  >
                                    +{perms.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}

                        {Object.entries(
                          level.permissions.reduce<
                            Record<string, Permission[]>
                          >((groups, perm) => {
                            (groups[perm.module] =
                              groups[perm.module] || []).push(perm);
                            return groups;
                          }, {})
                        ).length > 2 && (
                          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500">
                              +
                              {Object.keys(
                                level.permissions.reduce<
                                  Record<string, Permission[]>
                                >((groups, perm) => {
                                  (groups[perm.module] =
                                    groups[perm.module] || []).push(perm);
                                  return groups;
                                }, {})
                              ).length - 2}{" "}
                              more modules
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(level)}
                        className="gap-1.5"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit Access Level
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* --- Add/Edit Access Level Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            className="
        bg-background rounded-xl shadow-xl
        w-[100vw] max-w-4xl max-h-[92vh] min-h-[350px]
        flex flex-col
        p-0
        relative
        overflow-auto
      "
            style={{ maxHeight: "92vh" }}
            onSubmit={handleModalSubmit}
          >
            {/* Close Button */}
            <button
              className="absolute top-5 right-8 text-muted-foreground hover:text-destructive z-20"
              type="button"
              onClick={() => setShowModal(false)}
              tabIndex={-1}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="p-8 pb-2">
              <h2 className="font-bold text-2xl mb-2">
                {modalMode === "add" ? "Add Access Level" : "Edit Access Level"}
              </h2>
            </div>

            {/* Modal Body (scrolls as a whole) */}
            <div className="flex-1 px-8 pb-2">
              <div className="flex flex-col gap-5">
                {/* Access Level Name */}
                <div>
                  <Label className="mb-1">Access Level Name</Label>
                  <Input
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                    placeholder="Admin, User, etc."
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="mb-1">Description</Label>
                  <Textarea
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="(Optional) Summarize this access level"
                  />
                </div>

                {/* Permissions Section */}
                <div>
                  <Label className="mb-2 font-semibold text-lg">
                    System Permissions
                  </Label>
                  <div className="text-sm text-muted-foreground mb-3">
                    Select modules & permissions for this access level.
                  </div>
                  <Input
                    placeholder="Search permissions..."
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex gap-3 justify-end mb-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Select All (only visible permissions)
                        const newPerms = [
                          ...modalPermissions,
                          ...filteredPermissions.filter(
                            (p) =>
                              !modalPermissions.find((sel) => sel.id === p.id)
                          ),
                        ];
                        // Remove duplicates by id
                        const unique = Array.from(
                          new Map(
                            newPerms.map((perm) => [perm.id, perm])
                          ).values()
                        );
                        setModalPermissions(unique);
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Deselect only visible permissions
                        setModalPermissions((prev) =>
                          prev.filter(
                            (p) =>
                              !filteredPermissions.find((fp) => fp.id === p.id)
                          )
                        );
                      }}
                    >
                      Deselect All
                    </Button>
                  </div>
                  {/* --- Grouped Privileges: NO internal scroll, just grid/grouping! --- */}
                  <div className="space-y-6">
                    {permLoading ? (
                      <div className="text-center text-xs text-muted-foreground py-6">
                        Loading permissions...
                      </div>
                    ) : Object.entries(
                        filteredPermissions.reduce<{
                          [mod: string]: Permission[];
                        }>((groups, perm) => {
                          groups[perm.module] = groups[perm.module] || [];
                          groups[perm.module].push(perm);
                          return groups;
                        }, {})
                      ).length === 0 ? (
                      <div className="text-xs text-muted-foreground py-6">
                        No permissions found.
                      </div>
                    ) : (
                      Object.entries(
                        filteredPermissions.reduce<{
                          [mod: string]: Permission[];
                        }>((groups, perm) => {
                          groups[perm.module] = groups[perm.module] || [];
                          groups[perm.module].push(perm);
                          return groups;
                        }, {})
                      ).map(([mod, perms]) => (
                        <div key={mod} className="space-y-3">
                          <div className="font-bold text-base text-blue-600 mb-1">
                            {mod}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {perms.map((perm) => {
                              const isChecked = !!modalPermissions.find(
                                (p) => p.id === perm.id
                              );
                              return (
                                <button
                                  key={perm.id}
                                  type="button"
                                  className={`flex items-start gap-3 rounded p-2 select-none cursor-pointer
                              ${
                                isChecked
                                  ? "bg-blue-50 dark:bg-blue-900 border-blue-400"
                                  : "hover:bg-muted/20 border-transparent"
                              }
                              border transition-colors w-full text-left`}
                                  onClick={() => togglePermission(perm)}
                                >
                                  <span className="mt-1 flex-shrink-0">
                                    {isChecked ? (
                                      <svg width={22} height={22} fill="none">
                                        <circle
                                          cx={11}
                                          cy={11}
                                          r={10}
                                          fill="#2563EB"
                                        />
                                        <path
                                          d="M7.5 11.5l2 2 5-5"
                                          stroke="#fff"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    ) : (
                                      <svg width={22} height={22} fill="none">
                                        <circle
                                          cx={11}
                                          cy={11}
                                          r={9}
                                          stroke="#94a3b8"
                                          strokeWidth={2}
                                          fill="none"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  <div>
                                    <div className="font-semibold text-blue-800 dark:text-blue-200">
                                      {perm.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {perm.key}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {/* --- Summary of selected --- */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mt-4">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Selected Privileges:</strong>{" "}
                      {modalPermissions.length} of {allPermissions.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Footer - Always visible */}
            <div className="p-8 pt-0 border-t flex gap-3 justify-end bg-background z-10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {modalMode === "add" ? "Add Access Level" : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="max-w-sm w-full rounded-xl shadow-xl p-6">
            <CardTitle className="mb-2 text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Access Level?
            </CardTitle>
            <CardContent>
              <div className="mb-2">
                Are you sure you want to delete this access level? This action
                cannot be undone.
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button variant="ghost" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteId)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
