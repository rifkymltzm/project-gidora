import { useLocation, useOutlet } from "react-router-dom";

export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div
      key={location.key}
      className="relative w-full transform-gpu animate-page-enter"
    >
      {outlet}
    </div>
  );
}
