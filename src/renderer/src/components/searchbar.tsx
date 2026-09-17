import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CircleArrowOutUpLeft,
  CircleCheck,
  CornerDownLeft,
  MessageCircleMore,
  Search,
  SearchX,
  User,
} from "lucide-react";
import { RecallIcon } from "./svgs/recall-icon";
import { Button } from "./ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [messageFilterOpen, setMessageFilterOpen] = useState(false);
  const [messageFilter, setMessageFilter] = useState<string | null>("all");
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function toggleDialog(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", toggleDialog);
    return () => window.removeEventListener("keydown", toggleDialog);
  }, []);

  const messageFilters = [
    { icon: MessageCircleMore, label: "All Messages", value: "all" },
    { icon: CircleCheck, label: "From Contacts", value: "contacts" },
    { icon: User, label: "From Me", value: "me" },
  ];

  // The select is modal, so its own backdrop swallows the click that would
  // otherwise dismiss the dialog. Compare the press against the dialog's box
  // instead so a click on the overlay closes both layers in one go.
  function isPressOutsideDialog(event: MouseEvent | PointerEvent | TouchEvent) {
    const dialog = commandRef.current;
    if (!dialog) return false;

    const point =
      "changedTouches" in event
        ? (event.changedTouches[0] ?? event.touches[0])
        : event;
    if (!point) return false;

    const rect = dialog.getBoundingClientRect();
    return (
      point.clientX < rect.left ||
      point.clientX > rect.right ||
      point.clientY < rect.top ||
      point.clientY > rect.bottom
    );
  }

  function renderMessageFilterLabel() {
    if (messageFilter === "contacts") {
      return (
        <div className="text-muted-foreground flex items-center gap-2">
          <CircleCheck aria-hidden="true" />
          <span>From Contacts</span>
        </div>
      );
    }

    if (messageFilter === "me") {
      return (
        <div className="text-muted-foreground flex items-center gap-2">
          <User aria-hidden="true" />
          <span>From Me</span>
        </div>
      );
    }

    return (
      <div className="text-muted-foreground flex items-center gap-2">
        <MessageCircleMore aria-hidden="true" />
        <span>All Messages</span>
      </div>
    );
  }

  return (
    <>
      <Button
        variant={null}
        onClick={() => setOpen(true)}
        className="bg-accent hover:text-foreground text-muted-foreground rounded-full py-1.25 pr-1 text-base transition-colors"
      >
        <div className="flex items-center gap-20">
          <div className="flex items-center gap-2 font-normal">
            <Search className="size-4.5" aria-hidden="true" />
            <span>Search...</span>
          </div>
          <span className="bg-background text-muted-foreground rounded-full px-2 py-0.5 text-[13px] font-normal tracking-widest">
            ⌘K
          </span>
        </div>
      </Button>
      <CommandDialog
        description="Search your messages..."
        open={open}
        onOpenChange={setOpen}
      >
        <Command ref={commandRef}>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <CommandInput
              className="placeholder:text-muted-foreground text-base"
              placeholder="Search..."
            />
            <Select
              value={messageFilter}
              onValueChange={setMessageFilter}
              open={messageFilterOpen}
              onOpenChange={(nextOpen, details) => {
                setMessageFilterOpen(nextOpen);

                if (nextOpen || details.reason !== "outside-press") return;
                if (isPressOutsideDialog(details.event)) setOpen(false);
              }}
              items={messageFilters}
            >
              <SelectTrigger
                menuOpen={messageFilterOpen}
                className="w-full max-w-52 cursor-pointer"
              >
                <SelectValue>{renderMessageFilterLabel()}</SelectValue>
              </SelectTrigger>
              <SelectContent sideOffset={8} alignItemWithTrigger={false}>
                <SelectGroup>
                  {messageFilters.map((item) => (
                    <SelectItem
                      className="text-muted-foreground cursor-pointer"
                      key={item.value}
                      value={item.value}
                    >
                      <item.icon /> {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <CommandSeparator />
          <CommandList className="min-h-81.25 p-2 [&>[cmdk-list-sizer]]:h-full">
            <CommandEmpty className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 select-none">
              <SearchX className="size-12" aria-hidden="true" />
              <span className="text-base">No messages found</span>
            </CommandEmpty>
            <CommandGroup>
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <div className="text-muted-foreground flex w-full items-center justify-between px-4 py-3 select-none">
            <div className="flex shrink-0 items-center gap-2">
              <RecallIcon className="size-5" />
              <span className="capitalize">Your messages</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <div className="rounded-sm border p-1">
                    <ArrowUp className="size-3.25" aria-hidden="true" />
                  </div>
                  <div className="rounded-sm border p-1">
                    <ArrowDown className="size-3.25" aria-hidden="true" />
                  </div>
                </div>
                <span>Navigate</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="rounded-sm border p-1">
                  <CornerDownLeft className="size-3.25" aria-hidden="true" />
                </div>
                <span>Open</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="rounded-sm border p-1">
                  <CircleArrowOutUpLeft
                    className="size-3.25"
                    aria-hidden="true"
                  />
                </div>
                <span>Close</span>
              </div>
            </div>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
