"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import type { GalleryItem } from "@/types/gallery";
import { adminJsonRequest } from "@/lib/adminContentClient";
import { MAX_GALLERY_PHOTOS } from "@/lib/imageRules";

interface AdminGalleryManagerProps {
  initialItems: GalleryItem[];
}

const PAGE_SIZE = 8;

export default function AdminGalleryManager({
  initialItems,
}: AdminGalleryManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<GalleryItem | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const categories = Array.from(
    new Set(items.map((item) => item.category)),
  ).sort();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = items.filter((gallery) => {
    const matchesCategory = category === "all" || gallery.category === category;
    const searchableText = [
      gallery.title,
      gallery.category,
      gallery.location,
      gallery.organizer,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      matchesCategory &&
      (!normalizedQuery || searchableText.includes(normalizedQuery))
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const firstResult =
    filteredItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * PAGE_SIZE, filteredItems.length);

  const removeGallery = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await adminJsonRequest(
        `/api/admin/content/galleries/${encodeURIComponent(String(pendingDelete.id))}`,
        "DELETE",
      );
      setItems((current) =>
        current.filter((item) => String(item.id) !== String(pendingDelete.id)),
      );
      toast.success("Gallery deleted successfully.");
      setPendingDelete(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Gallery could not be deleted.",
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
            <h2 className="text-lg font-bold">Gallery list</h2>
            <p className="text-xs text-slate-500">{items.length} album(s)</p>
          </div>
          <Link
            href="/admin/galleries/add"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <Plus size={17} />
            Add gallery
          </Link>
        </div>
        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 sm:grid-cols-[minmax(240px,1fr)_220px] sm:px-6">
          <label className="relative">
            <span className="sr-only">Search galleries</span>
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
              placeholder="Search title, location, category..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
          </label>
          <label>
            <span className="sr-only">Filter galleries by category</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">
                  Cover
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Gallery
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Date / Location
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Photos
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
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {items.length === 0
                      ? "No galleries found. Use Add gallery to create the first one."
                      : "No galleries match the current search and filter."}
                  </td>
                </tr>
              ) : (
                pageItems.map((gallery) => (
                  <tr key={gallery.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 sm:px-6">
                      <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={gallery.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </td>
                    <td className="max-w-[300px] px-4 py-3">
                      <p className="line-clamp-2 font-semibold text-slate-900">
                        {gallery.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        {gallery.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p className="whitespace-nowrap">{gallery.date}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {gallery.location}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {gallery.photos.length} / {MAX_GALLERY_PHOTOS}
                    </td>
                    <td className="px-5 py-3 sm:px-6">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/gallery/${gallery.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          aria-label={`View ${gallery.title}`}
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/galleries/${gallery.id}/edit`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          aria-label={`Edit ${gallery.title}`}
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setPendingDelete(gallery)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label={`Delete ${gallery.title}`}
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
        title="Delete gallery?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” and its managed images will be permanently deleted. This action cannot be undone.`
            : ""
        }
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={removeGallery}
      />
    </div>
  );
}
