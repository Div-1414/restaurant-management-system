import { useAuth } from '../context/AuthContext';

const ServiceInactive = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3EBDD] px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Service Temporarily Inactivated
        </h1>

        <p className="text-gray-600 mb-6">
          Your restaurant services have been <b>inactivated by the company</b>.
          <br />
          Please contact support to reactivate your account.
        </p>

        <button
          onClick={logout}
          className="w-full btn-primary"
        >
          Logout
        </button>

        <p className="text-xs text-gray-400 mt-4">
          If you believe this is a mistake, contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ServiceInactive;
