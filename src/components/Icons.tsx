/**
 * Early-internet iconography, drawn as inline SVG.
 *
 * Inline rather than image files on purpose: they inherit the surrounding text
 * colour via `currentColor`, they scale without blurring, and they cost no
 * extra network requests. To recolour one, set a text colour on it or its
 * parent — `<FolderIcon className="text-clay" />`.
 *
 * `aria-hidden` on all of them because they are decoration sitting next to a
 * real text label. A screen reader announcing "folder graphic Kitten Spins"
 * adds nothing over just "Kitten Spins".
 */

type IconProps = { className?: string };

/** The classic Windows manila folder, closed. Used for category links. */
export function FolderIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 40"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* back of the folder */}
      <path
        d="M2 6a3 3 0 0 1 3-3h13l5 5h20a3 3 0 0 1 3 3v23a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z"
        fill="#f0b400"
        stroke="#8a5a00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* front flap, slightly lighter so it reads as two pieces */}
      <path
        d="M2 15h44v22a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z"
        fill="#ffd34d"
        stroke="#8a5a00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** An open folder, for the category you're currently looking at. */
export function FolderOpenIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 40"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 6a3 3 0 0 1 3-3h13l5 5h20a3 3 0 0 1 3 3v6H2z"
        fill="#f0b400"
        stroke="#8a5a00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* the front sheet tilts away, which is what reads as "open" */}
      <path
        d="M2 17h44l-6 20a3 3 0 0 1-3 2H5a3 3 0 0 1-3-3z"
        fill="#ffe08a"
        stroke="#8a5a00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The default Windows arrow cursor. */
export function CursorIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 26"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 1.5 17.5 15H10l3.5 8L10 24.5 6.5 16.5 2 20.5z"
        fill="#ffffff"
        stroke="#1a1a1a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Four-point sparkle. Pair with .twinkle to make it pulse. */
export function SparkleIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 0c1.2 7.2 3.6 9.6 12 12-8.4 2.4-10.8 4.8-12 12-1.2-7.2-3.6-9.6-12-12C8.4 9.6 10.8 7.2 12 0z"
        fill="currentColor"
      />
    </svg>
  );
}

/** A little 3.5" floppy disk. */
export function DiskIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        fill="#3a3a4a"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      <rect x="7" y="2.5" width="10" height="7" fill="#d8d8e0" />
      <rect x="13" y="3.5" width="2.5" height="5" fill="#3a3a4a" />
      <rect x="6" y="13" width="12" height="8" rx="1" fill="#d8d8e0" />
    </svg>
  );
}
