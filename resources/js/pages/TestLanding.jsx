import { Link } from 'react-router-dom';

export default function TestLanding() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h1 className="text-4xl font-bold text-center">Test Landing Page</h1>
      <p className="text-center mt-4">If you see this, the setup works!</p>
      <div className="text-center mt-4">
        <Link to="/login" className="text-blue-600">Go to Login</Link>
      </div>
    </div>
  );
}
