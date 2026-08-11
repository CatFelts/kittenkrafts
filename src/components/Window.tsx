/**
 * A Windows 98/XP style window frame, tinted pink.
 *
 * Wrap anything in it and it looks like an application window: bevelled edge,
 * gradient title bar, and the three little buttons in the corner.
 *
 *     <Window title="moss-agate.jpg">…anything…</Window>
 *
 * The styling lives in the .win / .win-bar / .win-btn classes in globals.css,
 * so recolouring every window on the site is a couple of lines there rather
 * than a hunt through components.
 *
 * The _ □ ✕ buttons are DECORATION — they are spans, not buttons, so they are
 * not focusable and screen readers skip them. A close button that doesn't
 * close anything is worse than no close button, and a real one would just be
 * a way for a customer to accidentally hide a product.
 */
export function Window({
  title,
  children,
  className = "",
  bodyClassName = "",
}: {
  /** Text in the title bar. Filenames read the most 2003. */
  title: string;
  children: React.ReactNode;
  /** Applied to the outer frame. */
  className?: string;
  /** Applied to the content area inside the frame. */
  bodyClassName?: string;
}) {
  return (
    <div className={`win ${className}`}>
      <div className="win-bar flex items-center gap-2 px-2 py-1">
        <span className="truncate font-display text-sm leading-none">
          {title}
        </span>
        <span className="ml-auto flex shrink-0 gap-1" aria-hidden="true">
          <span className="win-btn flex h-4 w-4 items-end justify-center text-[10px] leading-none">
            _
          </span>
          <span className="win-btn flex h-4 w-4 items-center justify-center text-[8px] leading-none">
            □
          </span>
          <span className="win-btn flex h-4 w-4 items-center justify-center text-[9px] leading-none">
            ✕
          </span>
        </span>
      </div>

      <div className={`p-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
