"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import { adminJsonRequest } from "@/lib/adminContentClient";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface Props {
  initialItems: Product[];
  categories: Category[];
}

export default function AdminProductManager({
  initialItems,
  categories,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const categoryNames = new Map(
    categories.map((item) => [item.slug, item.name]),
  );
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory =
          category === "all" || item.category === category;
        const text = item.title.toLowerCase();
        return (
          matchesCategory &&
          (!query.trim() || text.includes(query.trim().toLowerCase()))
        );
      }),
    [items, query, category],
  );

  const remove = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await adminJsonRequest(
        `/api/admin/content/products/${encodeURIComponent(pendingDelete.id)}`,
        "DELETE",
      );
      setItems((current) =>
        current.filter((item) => item.id !== pendingDelete.id),
      );
      setPendingDelete(null);
      toast.success("Product deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Product could not be deleted.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <span className="sr-only">Search products</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product title"
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-orange-500"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <Link
          href="/admin/products/add"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
        >
          <Plus size={17} />
          Add product
        </Link>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-11 overflow-hidden rounded-md bg-slate-100">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <strong className="line-clamp-1 max-w-md">
                        {item.title}
                      </strong>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {categoryNames.get(item.category) || item.category}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/products/${encodeURIComponent(item.id)}/edit`}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(item)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No products match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete product?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently removed.`
            : ""
        }
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
}
