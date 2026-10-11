"use client";

import { useEffect, useState } from "react";
import {
  Route as RouteIcon,
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  MapPin,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RouteItem {
  id: string;
  name: string;
  fee: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [routeName, setRouteName] = useState("");
  const [routeFee, setRouteFee] = useState<string>("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<RouteItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/routes");
      const data = await res.json();
      if (res.ok) {
        setRoutes(data.routes || []);
      } else {
        setErrorNotice(data.error || "Failed to load routes");
      }
    } catch (err: any) {
      setErrorNotice("Network error while loading routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setActiveRouteId(null);
    setRouteName("");
    setRouteFee("");
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (route: RouteItem) => {
    setModalMode("edit");
    setActiveRouteId(route.id);
    setRouteName(route.name);
    setRouteFee(route.fee.toString());
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim()) {
      setModalError("Please enter a route name");
      return;
    }
    const parsedFee = parseFloat(routeFee);
    if (isNaN(parsedFee) || parsedFee <= 0) {
      setModalError("Please enter a valid positive fee");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      const method = modalMode === "add" ? "POST" : "PUT";
      const payload =
        modalMode === "add"
          ? { name: routeName.trim(), fee: parsedFee }
          : { id: activeRouteId, name: routeName.trim(), fee: parsedFee };

      const res = await fetch("/api/admin/routes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to save route");
        setModalLoading(false);
        return;
      }

      setSuccessNotice(
        modalMode === "add"
          ? `Route "${routeName}" created successfully!`
          : `Route "${routeName}" updated successfully!`
      );
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err: any) {
      setModalError("Network error while saving route");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    setErrorNotice("");

    try {
      const res = await fetch(`/api/admin/routes?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorNotice(data.error || "Failed to delete route");
        setDeleteTarget(null);
        setDeleteLoading(false);
        return;
      }

      setSuccessNotice(`Route "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      fetchRoutes();
    } catch (err: any) {
      setErrorNotice("Network error while deleting route");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bus Routes & Fares
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage college transport routes, update annual fares, and track student enrollment.
          </p>
        </div>

        <button
          onClick={openAddModal}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Route</span>
        </button>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice("")}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => setErrorNotice("")}
            className="text-rose-600 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Routes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <RouteIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Routes Configured
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Click &quot;Add New Route&quot; above to create your first bus route.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{route.studentCount} student{route.studentCount === 1 ? "" : "s"}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {route.name}
                </h3>

                <div className="mt-4 mb-6">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Annual Route Fare
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(route.fee)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(route)}
                  type="button"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Route"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(route)}
                  type="button"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete Route"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {modalMode === "add" ? "Create New Bus Route" : "Edit Bus Route"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Route Name
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g. Warje Bridge"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Annual Route Fee (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={routeFee}
                  onChange={(e) => setRouteFee(e.target.value)}
                  placeholder="e.g. 22000"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === "add" ? "Create Route" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Route &quot;{deleteTarget.name}&quot;?
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete this route? This action cannot be undone.
              {deleteTarget.studentCount > 0 && (
                <span className="block mt-2 font-semibold text-rose-600 dark:text-rose-400">
                  ⚠️ Notice: This route has {deleteTarget.studentCount} enrolled student(s). Deletion will be rejected until students are reassigned.
                </span>
              )}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRoute}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
