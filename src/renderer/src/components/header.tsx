import type { User } from "../../../types";
import { SearchBar } from "./searchbar";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const firstName = user.firstName;
  const lastName = user.lastName;
  const initials =
    firstName && lastName
      ? firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase()
      : "U";

  return (
    <div className="absolute right-4 flex items-center gap-6 pr-6 pl-2">
      <SearchBar />
      <div className="flex items-center gap-2 select-none">
        <div className="bg-foreground text-background size-9 rounded-full p-2 text-sm">
          {initials}
        </div>
        <span>
          {firstName} {lastName}
        </span>
      </div>
    </div>
  );
}
