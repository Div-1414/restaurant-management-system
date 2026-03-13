import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

 // Hide navbar title on internal dashboards
if (
  location.pathname.startsWith('/owner') ||
  location.pathname.startsWith('/kitchen') ||
  location.pathname.startsWith('/manager') ||
  location.pathname.startsWith('/parcel') ||
  location.pathname.startsWith('/customer/menu')
) {
  return null;
}

  return (
    <nav className="py-6">
      <div className="flex justify-center">
        <h1 className="text-2xl font-serif tracking-wide text-[#5A3E1B]">
          Restro Management
        </h1>
      </div>
    </nav>
  );
};

export default Navbar;
