import { useEffect, useState } from "react";
import { CreditCardIcon, Search, SettingsIcon, UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./ui/command";

export function SearchBar() {
  const [open, setOpen] = useState(false);

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

  return (
    <div>
      <Button
        variant={null}
        onClick={() => setOpen(true)}
        className="bg-accent hover:text-foreground text-muted-foreground absolute right-4 rounded-full py-1.25 pr-1 text-base transition-colors"
      >
        <div className="flex items-center gap-20">
          <div className="flex items-center gap-2 font-normal">
            <Search className="size-4.5" aria-hidden="true" />
            <span>Search...</span>
          </div>
          <span className="bg-background text-foreground rounded-full px-2 py-0.5 text-[13px] font-normal tracking-widest">
            ⌘K
          </span>
        </div>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Settings">
              <CommandItem>
                <UserIcon />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <CreditCardIcon />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <SettingsIcon />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
