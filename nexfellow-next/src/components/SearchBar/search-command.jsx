
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
  Compass,
  Trophy,
  GroupIcon as Communities,
  Inbox,
  Calendar,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

import { BsArrowReturnLeft } from "react-icons/bs";

export default function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [error, setError] = React.useState(null);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (type) => {
    if (!query.trim()) return;

    const searchUrl = type
      ? `/search?q=${encodeURIComponent(query)}&type=${type}`
      : `/search?q=${encodeURIComponent(query)}`;

    router.push(searchUrl);
    setOpen(false);
  };
  React.useEffect(() => {
    if (open) {
      const down = (e) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === "p") {
            e.preventDefault();
            if (user?.username) router.push(`/dashboard/${user.username}`);
            setOpen(false);
          } else if (e.key === "e") {
            e.preventDefault();
            router.push("/explore");
            setOpen(false);
          } else if (e.key === "l") {
            e.preventDefault();
            router.push("/leaderboard");
            setOpen(false);
          } else if (e.key === "c") {
            e.preventDefault();
            router.push("/communities");
            setOpen(false);
          } else if (e.key === "i") {
            e.preventDefault();
            router.push("/inbox");
            setOpen(false);
          }
        }
      };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }
  }, [open, router, user?.username]);

  React.useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
        const userId = userData?.id || userData?._id;

        if (!userId) {
          // User not logged in yet, skip fetching
          setLoading(false);
          return;
        }

        // Fetch user profile
        const response = await api.get(`/user/profile`);
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSearch();
    }
  };

  return (
    <>
      <button
        style={{
          padding: "8px 20px",
          height: "40px",
          borderRadius: "10px",
          border: "1px solid #E6E6E6",
        }}
        onClick={() => setOpen(true)}
        className="sm:flex hidden items-center w-full gap-2 text-[16px] bg-background hover:bg-accent/50 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200 cursor-pointer"
      >
        <span className="sr-only">Open search</span>
        <Search className="h-4 w-4" style={{ color: "#6A6A6A" }} />
        <span className="flex-1 text-left" style={{ color: "#6A6A6A", fontFamily: "'Inter', sans-serif", fontSize: "16px" }}>Search</span>
        <kbd
          className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 font-mono text-[10px] font-medium"
          style={{ padding: "0.375rem 0.5rem", backgroundColor: "#F5F5F5", borderRadius: "4px", color: "#6A6A6A" }}
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="w-full max-w-2xl z-9999"
        style={{
          padding: "2rem",
        }}
      >
        <div
          className="flex items-center border-b px-3"
          style={{ padding: "0.75rem" }}
        >
          <CommandInput
            placeholder="Type to search..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
            className="border-0 focus:ring-0 focus:outline-none"
          />
        </div>
        <CommandList style={{ padding: "0.5rem" }}>
          <CommandEmpty>No results found.</CommandEmpty>
          {!query && (
            <>
              <CommandGroup heading="Navigation">
                <CommandItem
                  onSelect={() => {
                    if (user?.username) router.push(`/dashboard/${user.username}`);
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>P
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/explore");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="mr-2 h-4 w-4" />
                    <span>Explore</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>E
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/leaderboard");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Leaderboard</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>L
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/communities");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Communities className="mr-2 h-4 w-4" />
                    <span>Communities</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>C
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/inbox");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Inbox className="mr-2 h-4 w-4" />
                    <span>Inbox</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>I
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {query && (
            <>
              <CommandGroup heading="Search Options">
                <CommandItem onSelect={() => handleSearch()}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span>{" "}
                    everywhere
                  </span>
                  <CommandShortcut>
                    <BsArrowReturnLeft />
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Filter By">
                <CommandItem onSelect={() => handleSearch("users")}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Users
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("posts")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Posts
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("communities")}>
                  <Communities className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Communities
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("events")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Events
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("contests")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Contests
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("challenges")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Challenges
                  </span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
        <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground border-t">
          <kbd
            className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
            style={{ padding: "0.375rem 0.5rem" }}
          >
            <span>↑↓</span>
          </kbd>{" "}
          <span className="px-1" style={{ padding: "0.25rem 0" }}>
            to navigate
          </span>
          <kbd
            className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
            style={{ padding: "0.375rem 0.5rem" }}
          >
            <span>↵</span>
          </kbd>{" "}
          <span className="px-1" style={{ padding: "0.25rem 0" }}>
            to select
          </span>
          <kbd
            className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
            style={{ padding: "0.375rem 0.5rem" }}
          >
            <span style={{ fontSize: "0.5rem" }}>esc</span>
          </kbd>{" "}
          <span className="px-1" style={{ padding: "0.25rem 0" }}>
            to close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}

function Search(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function SearchCommandMobile() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [error, setError] = React.useState(null);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (type) => {
    if (!query.trim()) return;

    const searchUrl = type
      ? `/search?q=${encodeURIComponent(query)}&type=${type}`
      : `/search?q=${encodeURIComponent(query)}`;

    router.push(searchUrl);
    setOpen(false);
  };
  React.useEffect(() => {
    if (open) {
      const down = (e) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === "p") {
            e.preventDefault();
            if (user?.username) router.push(`/dashboard/${user.username}`);
            setOpen(false);
          } else if (e.key === "e") {
            e.preventDefault();
            router.push("/explore");
            setOpen(false);
          } else if (e.key === "l") {
            e.preventDefault();
            router.push("/leaderboard");
            setOpen(false);
          } else if (e.key === "c") {
            e.preventDefault();
            router.push("/communities");
            setOpen(false);
          } else if (e.key === "i") {
            e.preventDefault();
            router.push("/inbox");
            setOpen(false);
          }
        }
      };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }
  }, [open, router, user?.username]);

  React.useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
        const userId = userData?.id || userData?._id;

        if (!userId) {
          // User not logged in yet, skip fetching
          setLoading(false);
          return;
        }

        // Fetch user profile
        const response = await api.get(`/user/profile`);
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSearch();
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Search className="h-5 w-5 " style={{ marginRight: "5px" }} />
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="w-full max-w-2xl z-9999"
        style={{
          padding: "2rem",
        }}
      >
        <div
          className="flex items-center border-b px-3"
          style={{ padding: "0.75rem" }}
        >
          <CommandInput
            placeholder="Type to search..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
            className="border-0 focus:ring-0 focus:outline-none w-full"
          />
        </div>
        <CommandList style={{ padding: "0.5rem" }}>
          <CommandEmpty>No results found.</CommandEmpty>
          {!query && (
            <>
              <CommandGroup heading="Navigation">
                <CommandItem
                  onSelect={() => {
                    if (user?.username) router.push(`/dashboard/${user.username}`);
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>P
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/explore");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="mr-2 h-4 w-4" />
                    <span>Explore</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>E
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/leaderboard");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Leaderboard</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>L
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/communities");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Communities className="mr-2 h-4 w-4" />
                    <span>Communities</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>C
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    router.push("/inbox");
                    setOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Inbox className="mr-2 h-4 w-4" />
                    <span>Inbox</span>
                  </div>
                  <CommandShortcut>
                    <kbd
                      className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      style={{ padding: "0.375rem 0.5rem" }}
                    >
                      <span className="text-xs">⌘</span>I
                    </kbd>
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {query && (
            <>
              <CommandGroup heading="Search Options">
                <CommandItem onSelect={() => handleSearch()}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span>{" "}
                    everywhere
                  </span>
                  <CommandShortcut>
                    <BsArrowReturnLeft />
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Filter By">
                <CommandItem onSelect={() => handleSearch("users")}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Users
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("posts")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Posts
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("communities")}>
                  <Communities className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Communities
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("events")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Events
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("contests")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Contests
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearch("challenges")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Search{" "}
                    <span className="font-medium">&quot;{query}&quot;</span> in
                    Challenges
                  </span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
        <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground border-t">
          <kbd
            className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
            style={{ padding: "0.375rem 0.5rem" }}
          >
            <span>↑↓</span>
          </kbd>{" "}
          <span className="px-1" style={{ padding: "0.25rem 0" }}>
            to navigate
          </span>
          <kbd
            className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
            style={{ padding: "0.375rem 0.5rem" }}
          >
            <span>↵</span>
          </kbd>{" "}
          <span className="px-1" style={{ padding: "0.25rem 0" }}>
            to select
          </span>
          <kbd
            className="pointer-events-none portrait:hidden inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
            style={{ padding: "0.375rem 0.5rem" }}
          >
            <span style={{ fontSize: "0.5rem" }}>esc</span>
          </kbd>{" "}
          <span className="px-1" style={{ padding: "0.25rem 0" }}>
            to close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
