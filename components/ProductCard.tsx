"use client";

import type { MouseEvent } from "react";

export type ProductCardProps = {
  id: string;
  name: string;
  shopName: string;
  price: number;
  image?: string | null;
  currency?: string;
  onAdd?: (productId: string) => void;
  disabled?: boolean;
  className?: string;
};

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);

export default function ProductCard({
  id,
  name,
  shopName,
  price,
  image,
  currency = "NGN",
  onAdd,
  disabled = false,
  className = "",
}: ProductCardProps) {
  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onAdd?.(id);
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7.5h16l-1.5 12h-13L4 7.5Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7.5V5a4 4 0 0 1 8 0v2.5"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="mb-1 text-xs font-normal text-slate-500">{shopName}</p>
        <h3 className="mb-4 font-semibold leading-snug text-[#203c35]">{name}</h3>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-base font-semibold text-[#203c35]">
            {formatPrice(price, currency)}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled}
            aria-label={`Add ${name} to bag`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d9ef78] text-[#203c35] transition-colors hover:bg-[#c8df62] focus:outline-none focus:ring-2 focus:ring-[#203c35] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
