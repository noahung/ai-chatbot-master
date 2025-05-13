
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Automatically redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-4 rounded-full">
            <MessageSquare className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          ChatFlow AI Assistant
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Create customized AI chatbots for your clients with personalized training data and seamless website integration.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button 
              size="lg" 
              className="text-lg px-6"
              onClick={() => navigate("/dashboard")}
            >
              Enter Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                className="text-lg px-6"
                onClick={() => navigate("/auth")}
              >
                Sign In <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-6"
                onClick={() => {
                  navigate("/auth");
                  // Set the active tab to signup on the Auth page
                  localStorage.setItem("authTab", "signup");
                }}
              >
                Create Account
              </Button>
            </>
          )}
        </div>

        {user && (
          <p className="text-sm text-gray-500 mt-6">
            Redirecting to dashboard automatically...
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
