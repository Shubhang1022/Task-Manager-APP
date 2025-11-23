import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/AuthForm";
import { CheckCircle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        <div className="hidden md:block">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Task Manager
            </h1>
            <p className="text-xl text-muted-foreground">
              Stay organized and productive with our beautiful task management app
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground">Create and organize tasks effortlessly</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground">Track progress with completion status</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground">Secure authentication for your data</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;