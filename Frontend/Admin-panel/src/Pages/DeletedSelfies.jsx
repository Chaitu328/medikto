import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  Shield,
  User,
  Crown,
  AlertTriangle,
  Clock3,
  Image as ImageIcon,
} from "lucide-react";

import api from "../api/axios";

export default function DeletedSelfies() {

  const [deletedSelfies, setDeletedSelfies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [planFilter, setPlanFilter] =
    useState("All");

  const [deletedByFilter, setDeletedByFilter] =
    useState("All");

  const [recoveryFilter, setRecoveryFilter] =
    useState("All");

  // ================= FETCH =================

  const fetchDeletedSelfies =
    async () => {

      try {

        setLoading(true);

        const response =
          await api.get(
            "/admin/deleted-selfies"
          );

        const data =
          response?.data?.doses || [];

        setDeletedSelfies(data);

      } catch (error) {

        console.log(
          "Deleted selfies error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDeletedSelfies();
  }, []);

  // ================= FILTERS =================

  const filteredSelfies =
    useMemo(() => {

      return deletedSelfies.filter(
        (item) => {

          const matchesSearch =

            item?.user?.firstName
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item?.user?.phone
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item?._id
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesPlan =

            planFilter === "All" ||

            item?.planType ===
              planFilter.toLowerCase();

          const matchesDeletedBy =

            deletedByFilter === "All" ||

            item?.deletedBy ===
              deletedByFilter.toLowerCase();

          const now = new Date();

          const recoverDate =
            new Date(
              item?.canRecoverUntil
            );

          const recoverable =
            recoverDate > now;

          const matchesRecovery =

            recoveryFilter === "All" ||

            (recoveryFilter ===
              "Recoverable" &&
              recoverable) ||

            (recoveryFilter ===
              "Expired" &&
              !recoverable);

          return (
            matchesSearch &&
            matchesPlan &&
            matchesDeletedBy &&
            matchesRecovery
          );
        }
      );
    }, [
      deletedSelfies,
      search,
      planFilter,
      deletedByFilter,
      recoveryFilter,
    ]);

  // ================= RECOVER =================

  const recoverSelfie =
    async (id) => {

      try {

        await api.put(
          `/admin/recover-selfie/${id}`
        );

        fetchDeletedSelfies();

      } catch (error) {

        console.log(error);
      }
    };

  // ================= DELETE FOREVER =================

  const deleteForever =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete permanently?"
        );

      if (!confirmDelete) return;

      try {

        await api.delete(
          `/admin/delete-selfie/${id}`
        );

        fetchDeletedSelfies();

      } catch (error) {

        console.log(error);
      }
    };

  // ================= STATS =================

  const totalDeleted =
    deletedSelfies.length;

  const recoverableCount =
    deletedSelfies.filter(
      (item) =>
        new Date(
          item?.canRecoverUntil
        ) > new Date()
    ).length;

  const premiumDeleted =
    deletedSelfies.filter(
      (item) =>
        item?.planType ===
        "premium"
    ).length;

  const systemDeleted =
    deletedSelfies.filter(
      (item) =>
        item?.deletedBy ===
        "system"
    ).length;

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Loading Deleted Selfies...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">

      {/* HEADER */}

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">

        <div className="flex items-center justify-between flex-wrap gap-4">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            <div>

              <h1 className="text-4xl font-bold text-[#0F172A]">
                Deleted Selfies
              </h1>

              <p className="text-[#64748B] mt-2">
                Recover deleted patient verification images
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">

          <Trash2 className="w-10 h-10 text-red-500 mb-4" />

          <p className="text-sm text-[#64748B] font-semibold">
            Total Deleted
          </p>

          <h2 className="text-4xl font-bold text-[#0F172A] mt-2">
            {totalDeleted}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">

          <RotateCcw className="w-10 h-10 text-[#10B981] mb-4" />

          <p className="text-sm text-[#64748B] font-semibold">
            Recoverable
          </p>

          <h2 className="text-4xl font-bold text-[#0F172A] mt-2">
            {recoverableCount}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">

          <Crown className="w-10 h-10 text-amber-500 mb-4" />

          <p className="text-sm text-[#64748B] font-semibold">
            Premium Deleted
          </p>

          <h2 className="text-4xl font-bold text-[#0F172A] mt-2">
            {premiumDeleted}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">

          <Shield className="w-10 h-10 text-[#2563EB] mb-4" />

          <p className="text-sm text-[#64748B] font-semibold">
            System Deleted
          </p>

          <h2 className="text-4xl font-bold text-[#0F172A] mt-2">
            {systemDeleted}
          </h2>
        </div>
      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* SEARCH */}

          <div className="relative">

            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />

            <input
              type="text"
              placeholder="Search patient..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full h-12 rounded-2xl border border-slate-200 bg-[#F8FAFC] pl-12 pr-4 outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* PLAN */}

          <select
            value={planFilter}
            onChange={(e) =>
              setPlanFilter(
                e.target.value
              )
            }
            className="h-12 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 outline-none"
          >
            <option value="All">
              All Plans
            </option>

            <option value="free">
              Free
            </option>

            <option value="basic">
              Basic
            </option>

            <option value="premium">
              Premium
            </option>
          </select>

          {/* DELETED BY */}

          <select
            value={deletedByFilter}
            onChange={(e) =>
              setDeletedByFilter(
                e.target.value
              )
            }
            className="h-12 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 outline-none"
          >
            <option value="All">
              Deleted By
            </option>

            <option value="system">
              System
            </option>

            <option value="user">
              User
            </option>

            <option value="admin">
              Admin
            </option>
          </select>

          {/* RECOVERY */}

          <select
            value={recoveryFilter}
            onChange={(e) =>
              setRecoveryFilter(
                e.target.value
              )
            }
            className="h-12 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 outline-none"
          >
            <option value="All">
              Recovery Status
            </option>

            <option value="Recoverable">
              Recoverable
            </option>

            <option value="Expired">
              Expired
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-[#F8FAFC] border-b border-slate-200">

              <tr className="text-left">

                <th className="px-6 py-4 text-sm font-bold text-[#64748B]">
                  Patient
                </th>

                <th className="px-6 py-4 text-sm font-bold text-[#64748B]">
                  Plan
                </th>

                <th className="px-6 py-4 text-sm font-bold text-[#64748B]">
                  Deleted By
                </th>

                <th className="px-6 py-4 text-sm font-bold text-[#64748B]">
                  Deleted Date
                </th>

                <th className="px-6 py-4 text-sm font-bold text-[#64748B]">
                  Recover Until
                </th>

                <th className="px-6 py-4 text-sm font-bold text-[#64748B]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredSelfies.map(
                (item) => {

                  const recoverable =
                    new Date(
                      item?.canRecoverUntil
                    ) > new Date();

                  return (
                    <tr
                      key={item?._id}
                      className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                    >

                      {/* USER */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-[#64748B]" />
                          </div>

                          <div>

                            <h3 className="font-bold text-[#0F172A]">
                              {item?.user
                                ?.firstName ||
                                "Unknown"}
                            </h3>

                            <p className="text-sm text-[#64748B]">
                              {item?.user
                                ?.phone ||
                                "--"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PLAN */}

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase

                          ${
                            item?.planType ===
                            "premium"

                              ? "bg-amber-50 text-amber-700"

                              : item?.planType ===
                                "basic"

                              ? "bg-blue-50 text-blue-700"

                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item?.planType}
                        </span>
                      </td>

                      {/* DELETED BY */}

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase

                          ${
                            item?.deletedBy ===
                            "system"

                              ? "bg-red-50 text-red-700"

                              : item?.deletedBy ===
                                "admin"

                              ? "bg-purple-50 text-purple-700"

                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item?.deletedBy}
                        </span>
                      </td>

                      {/* DELETED DATE */}

                      <td className="px-6 py-5 text-sm text-[#475569]">

                        {item?.deletedAt
                          ? new Date(
                              item.deletedAt
                            ).toLocaleDateString()
                          : "--"}
                      </td>

                      {/* RECOVER */}

                      <td className="px-6 py-5">

                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full

                          ${
                            recoverable

                              ? "bg-emerald-50 text-emerald-700"

                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {recoverable
                            ? "Available"

                            : "Expired"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          {recoverable && (

                            <button
                              onClick={() =>
                                recoverSelfie(
                                  item?._id
                                )
                              }
                              className="h-10 px-4 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                            >
                              <RotateCcw className="w-4 h-4" />

                              Recover
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteForever(
                                item?._id
                              )
                            }
                            className="h-10 px-4 rounded-xl bg-red-500 text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />

                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* EMPTY */}

        {filteredSelfies.length === 0 && (

          <div className="py-20 text-center">

            <AlertTriangle className="w-14 h-14 mx-auto text-slate-300 mb-4" />

            <h3 className="text-xl font-bold text-[#0F172A]">
              No Deleted Selfies
            </h3>

            <p className="text-[#64748B] mt-2">
              No deleted records found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}