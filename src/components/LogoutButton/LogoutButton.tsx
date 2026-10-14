import { LogOut } from "lucide-react";
import { useAuth } from "../../contexts/authContext";

interface LogoutButtonProps {
  destino?: string;
  className?: string;
}

export function LogoutButton({
  destino = "/login",
  className = "",
}: LogoutButtonProps) {
  const { sair } = useAuth();

  function handleLogout() {
    sair();
    window.history.pushState({}, "", destino);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`inline-flex items-center gap-1.5 rounded-pill border border-black/15 bg-white px-4 py-2.5 font-body text-[13px] font-bold text-black transition-colors hover:bg-black/5 ${className}`}
    >
      <LogOut size={15} />
      Sair
    </button>
  );
}