import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="heading-1 text-primary mb-4">Welcome Back</h1>
          <p className="body-normal text-neutral-content">
            Sign in to continue your mystical journey
          </p>
        </div>
        
        <div className="card card-mystical">
          <div className="card-body">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: "btn btn-primary",
                  card: "shadow-none bg-transparent",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}