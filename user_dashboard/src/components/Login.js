import { gapi } from "gapi-script";

const CLIENT_ID = "998493125410-idld22gb9kbodgstq6odvbp76ighcs0h.apps.googleusercontent.com";

const Login = ({ onLoginSuccess }) => {
  const handleLogin = () => {
    gapi.load("auth2", () => {
      const auth2 = gapi.auth2.init({
        client_id: CLIENT_ID,
        scope: "profile email",
      });

      auth2.signIn().then((googleUser) => {
        const profile = googleUser.getBasicProfile();
        const user = {
          name: profile.getName(),
          email: profile.getEmail(),
          imageUrl: profile.getImageUrl(),
        };
        onLoginSuccess(user);
      });
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Login with Google
        </h2>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
