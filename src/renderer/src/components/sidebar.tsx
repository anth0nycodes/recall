import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { cn } from "cn";
import { PanelLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { RecallIcon } from "./svgs/recall-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const fade = {
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export function Sidebar() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    function toggleSidebar(e: KeyboardEvent) {
      if ((e.ctrlKey && e.key === "b") || (e.metaKey && e.key === "b")) {
        setOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", toggleSidebar);
    return () => window.removeEventListener("keydown", toggleSidebar);
  }, []);

  function renderSidebarContent() {
    if (open) {
      return (
        <div
          key="open"
          className="col-start-1 row-start-1 flex items-center justify-between"
        >
          <div className="flex shrink-0 items-center gap-2 pl-2">
            <RecallIcon size={20} />
            <motion.span
              initial={{ opacity: 0 }}
              {...fade}
              className="text-[22px] font-semibold whitespace-nowrap"
            >
              recall
            </motion.span>
          </div>
          <SidebarToggle open={open} setOpen={setOpen} />
        </div>
      );
    }

    return (
      <motion.div key="closed" {...fade} className="col-start-1 row-start-1">
        <SidebarToggle open={open} setOpen={setOpen} />
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "border-accent flex shrink-0 flex-col overflow-hidden border-2 p-2",
        "ease-sidebar transition-[width] duration-300 motion-reduce:transition-none",
        open ? "w-65" : "w-14"
      )}
    >
      <div className="grid grid-cols-1">
        <AnimatePresence initial={false}>
          {renderSidebarContent()}
        </AnimatePresence>
      </div>

      {/* OTHER CONTENT LIKE NAVIGATION, ETC. CAN GO HERE */}
      <div></div>
    </div>
  );
}

interface SidebarToggleProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const iconCrossfade =
  "col-start-1 row-start-1 transition-opacity duration-200 motion-reduce:transition-none";

function SidebarToggle({ open, setOpen }: SidebarToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              "hover:bg-accent group h-max shrink-0 rounded-md p-2",
              open ? "cursor-w-resize" : "cursor-e-resize"
            )}
            aria-label="Toggle sidebar button"
          >
            <span className="grid size-5 place-items-center">
              <PanelLeft
                aria-hidden="true"
                className={cn(
                  "text-muted-foreground size-5",
                  iconCrossfade,
                  open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              />
              <RecallIcon
                size={20}
                aria-hidden="true"
                className={cn(
                  iconCrossfade,
                  open ? "opacity-0" : "opacity-100 group-hover:opacity-0"
                )}
              />
            </span>
          </button>
        }
      />
      <TooltipContent
        className="bg-background border-accent rounded-full border-2 py-1"
        side={open ? "bottom" : "right"}
        sideOffset={open ? 6 : 16}
      >
        <span className="text-foreground text-sm font-medium">
          {open ? "Close sidebar" : "Open sidebar"}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
