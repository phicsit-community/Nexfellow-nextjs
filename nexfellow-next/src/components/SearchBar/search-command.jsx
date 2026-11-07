"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Users,
  FileText,
  GroupIcon as Communities,
  Inbox,
  Calendar,
  Search as SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BsArrowReturnLeft } from "react-icons/bs";
import api from "../../lib/axios";
import styles from "./SearchCommand.module.css";

// ── Platform-aware shortcut labels ──────────────────────────────────────────
// Both ⌘K and Ctrl+K open search, but the hint should name the key the user
// actually has. The server snapshot is "not Mac" so hydration never mismatches.
const noopSubscribe = () => () => {};
const detectMac = () =>
  /mac|iphone|ipad|ipod/i.test(
    navigator.userAgentData?.platform || navigator.platform || ""
  );

function useIsMac() {
  return React.useSyncExternalStore(noopSubscribe, detectMac, () => false);
}

function Kbd({ children, className = "" }) {
  return <kbd className={`${styles.kbd} ${className}`}>{children}</kbd>;
}

function ShortcutKbd({ keyLabel, className }) {
  const isMac = useIsMac();
  return (
    <Kbd className={className}>
      <span>{isMac ? "⌘" : "Ctrl"}</span>
      <span>{keyLabel}</span>
    </Kbd>
  );
}

// ── ⌘K / Ctrl+K ─────────────────────────────────────────────────────────────
// Several triggers can be mounted at once (e.g. a hidden desktop bar plus a
// mobile icon). The first handler claims the event via preventDefault and the
// rest skip it, so a single keypress never stacks two dialogs.
function useOpenShortcut(setOpen) {
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.defaultPrevented) return;
      if (e.key?.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);
}

const FILTERS = [
  { type: "users", label: "Users", Icon: Users },
  { type: "posts", label: "Posts", Icon: FileText },
  { type: "communities", label: "Communities", Icon: Communities },
  { type: "events", label: "Events", Icon: Calendar },
  { type: "contests", label: "Contests", Icon: Calendar },
  { type: "challenges", label: "Challenges", Icon: Calendar },
];

function SearchDialog({ open, onOpenChange }) {
  const [query, setQuery] = React.useState("");
  const [user, setUser] = React.useState(null);
  const router = useRouter();

  // Fetch the fresh username the first time the dialog opens (for the Profile
  // shortcut) instead of on every page load for every mounted trigger.
  React.useEffect(() => {
    if (!open || user) return;
    let cancelled = false;
    const cached =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    if (!(cached?.id || cached?._id)) return;
    api
      .get("/user/profile")
      .then((res) => !cancelled && setUser(res.data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const close = () => onOpenChange(false);

  const goToProfile = () => {
    if (user?.username) router.push(`/dashboard/${user.username}`);
    close();
  };

  const goToInbox = () => {
    router.push("/inbox");
    close();
  };

  const handleSearch = (type) => {
    if (!query.trim()) return;
    const q = encodeURIComponent(query);
    router.push(type ? `/search?q=${q}&type=${type}` : `/search?q=${q}`);
    close();
  };

  // ⌘P / ⌘I only while the palette is open
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key?.toLowerCase();
      if (key === "p") {
        e.preventDefault();
        goToProfile();
      } else if (key === "i") {
        e.preventDefault();
        goToInbox();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.username]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSearch();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search people, posts and more">
      <div className="flex items-center border-b" style={{ padding: "0.75rem" }}>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
          onKeyDown={handleKeyDown}
          className="w-full border-0 focus:outline-none focus:ring-0"
        />
      </div>
      <CommandList style={{ padding: "0.5rem" }}>
        <CommandEmpty>No results found.</CommandEmpty>
        {!query && (
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={goToProfile} className="flex cursor-pointer items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>Profile</span>
              </div>
              <CommandShortcut>
                <ShortcutKbd keyLabel="P" className={styles.hideOnTouch} />
              </CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={goToInbox} className="flex cursor-pointer items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Inbox className="h-4 w-4" />
                <span>Inbox</span>
              </div>
              <CommandShortcut>
                <ShortcutKbd keyLabel="I" className={styles.hideOnTouch} />
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}

        {query && (
          <>
            <CommandGroup heading="Search Options">
              <CommandItem onSelect={() => handleSearch()} className="cursor-pointer gap-3">
                <SearchIcon className="h-4 w-4" />
                <span>
                  Search <span className="font-medium">&quot;{query}&quot;</span> everywhere
                </span>
                <CommandShortcut>
                  <BsArrowReturnLeft />
                </CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Filter By">
              {FILTERS.map(({ type, label, Icon }) => (
                <CommandItem key={type} onSelect={() => handleSearch(type)} className="cursor-pointer gap-3">
                  <Icon className="h-4 w-4" />
                  <span>
                    Search <span className="font-medium">&quot;{query}&quot;</span> in {label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      {/* Keyboard legend — meaningless on touch screens, so hidden there */}
      <div className={`${styles.legend} ${styles.hideOnTouch} border-t text-muted-foreground`}>
        <Kbd>↑↓</Kbd>
        <span>to navigate</span>
        <Kbd>↵</Kbd>
        <span>to select</span>
        <Kbd>esc</Kbd>
        <span>to close</span>
      </div>
    </CommandDialog>
  );
}

/**
 * Search trigger + command palette.
 *
 * variant:
 *  - "responsive" (default): full search bar from 640px up, icon button below.
 *  - "bar":  always the full bar.
 *  - "icon": always the icon button.
 */
export default function SearchCommand({ variant = "responsive", className = "" }) {
  const [open, setOpen] = React.useState(false);
  const isMac = useIsMac();
  useOpenShortcut(setOpen);

  const shortcut = isMac ? "Meta+K" : "Control+K";

  return (
    <>
      {variant !== "icon" && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          aria-keyshortcuts={shortcut}
          className={`${styles.bar} ${variant === "responsive" ? styles.barResponsive : ""} ${className}`}
        >
          <SearchIcon className={styles.barIcon} aria-hidden="true" />
          <span className={styles.barPlaceholder}>Search</span>
          <ShortcutKbd keyLabel="K" className={styles.barKbd} />
        </button>
      )}
      {variant !== "bar" && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          aria-keyshortcuts={shortcut}
          className={`${styles.iconButton} ${variant === "responsive" ? styles.iconResponsive : ""} ${className}`}
        >
          <SearchIcon className={styles.iconButtonIcon} aria-hidden="true" />
        </button>
      )}
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function SearchCommandMobile(props) {
  return <SearchCommand {...props} variant="icon" />;
}
