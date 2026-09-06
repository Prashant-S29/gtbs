"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import { adminJsonRequest } from "@/lib/adminContentClient";
import type { TeamMember } from "@/types/team";

interface AdminTeamManagerProps {
  initialItems: TeamMember[];
}

const PAGE_SIZE = 8;

export default function AdminTeamManager({
  initialItems,
}: AdminTeamManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = items.filter((member) =>
    [member.name, member.role, member.gujarati?.name, member.gujarati?.role]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const firstResult =
    filteredItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * PAGE_SIZE, filteredItems.length);

  const removeMember = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await adminJsonRequest(
        `/api/admin/content/team/${encodeURIComponent(pendingDelete.id)}`,
        "DELETE",
      );
      setItems((current) =>
        current.filter((item) => item.id !== pendingDelete.id),
      );
      setPendingDelete(null);
      toast.success("Team member deleted successfully.");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Team member could not be deleted.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold">Team member list</h2>
            <p className="text-xs text-slate-500">{items.length} member(s)</p>
          </div>
          <Link
            href="/admin/team/add"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <Plus size={17} />
            Add team member
          </Link>
        </div>

        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <label className="relative block max-w-xl">
            <span className="sr-only">Search team members</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search member name or role..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">
                  Photo
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Member
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Role
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-right font-semibold sm:px-6"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {items.length === 0
                      ? "No team members found. Use Add team member to create the first one."
                      : "No team members match the current search."}
                  </td>
                </tr>
              ) : (
                pageItems.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={member.image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {member.name}
                      </p>
                      {member.gujarati?.name ? (
                        <p className="mt-0.5 text-xs text-slate-500" lang="gu">
                          {member.gujarati.name}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{member.role}</td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/team/${member.id}/edit`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          aria-label={`Edit ${member.name}`}
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setPendingDelete(member)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label={`Delete ${member.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-slate-500">
            Showing {firstResult}-{lastResult} of {filteredItems.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="min-w-20 text-center text-xs font-semibold text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete team member?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be permanently deleted. This action cannot be undone.`
            : ""
        }
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={removeMember}
      />
    </div>
  );
}
