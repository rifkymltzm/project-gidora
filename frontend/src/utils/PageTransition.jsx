import { useLocation, useOutlet } from 'react-router-dom';

export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div key={location.key} className="animate-page-enter relative w-full">
      {outlet}
    </div>
  );
}
