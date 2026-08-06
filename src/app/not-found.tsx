import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl">Not found</h1>
      <p className="mt-4 text-muted">
        That page isn't here. It may have been a listing that sold.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block rounded-full bg-clay px-6 py-3 text-sm text-white transition-colors hover:bg-clay-dark"
      >
        Go to the shop
      </Link>
    </div>
  );
}
