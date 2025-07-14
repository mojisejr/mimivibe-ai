import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/* Header */}
      <header className="navbar bg-base-100/90 backdrop-blur-sm shadow-lg">
        <div className="navbar-start">
          {/* Mobile: Logo only, Desktop: Logo + Text */}
          <div className="flex items-center">
            {/* Mobile version - logo only */}
            <div className="sm:hidden">
              <Logo
                size="xl"
                showText={false}
                className="hover:scale-105 transition-transform duration-200 cursor-pointer"
              />
            </div>

            {/* Desktop version - logo + text */}
            <div className="hidden sm:flex">
              <Logo
                size="xl"
                showText={true}
                className="hover:scale-105 transition-transform duration-200 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="navbar-end">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary">Sign In</button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* Hero Section */}
      <main className="content-container">
        <div className="hero min-h-[80vh]">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="heading-1 mb-6">
                Discover Your Path with{" "}
                <span className="text-primary">AI Tarot</span>
              </h1>
              <p className="body-large mb-8 text-neutral-content">
                Unlock mystical insights and guidance through the power of
                AI-enhanced tarot readings. Connect with your inner wisdom and
                explore what the cards reveal about your journey.
              </p>

              <SignedIn>
                <Link href="/ask" className="btn btn-mystical btn-lg">
                  Start Reading
                </Link>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-mystical btn-lg">
                    Begin Your Journey
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-16">
          <h2 className="heading-2 text-center mb-12">Why Choose MiMiVibes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-mystical">
              <div className="card-body text-center">
                <h3 className="heading-3 text-primary mb-4">
                  AI-Powered Insights
                </h3>
                <p className="body-normal">
                  Our advanced AI interprets traditional tarot wisdom with
                  modern understanding
                </p>
              </div>
            </div>

            <div className="card card-mystical">
              <div className="card-body text-center">
                <h3 className="heading-3 text-primary mb-4">
                  Personalized Readings
                </h3>
                <p className="body-normal">
                  Each reading is tailored to your unique situation and
                  spiritual journey
                </p>
              </div>
            </div>

            <div className="card card-mystical">
              <div className="card-body text-center">
                <h3 className="heading-3 text-primary mb-4">24/7 Guidance</h3>
                <p className="body-normal">
                  Access mystical wisdom whenever you need clarity and direction
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Navigation */}
      <SignedIn>
        <div className="btm-nav mobile-only">
          <Link href="/ask" className="btm-nav-item">
            <span className="text-xs">Ask</span>
          </Link>
          <Link href="/history" className="btm-nav-item">
            <span className="text-xs">History</span>
          </Link>
          <Link href="/profile" className="btm-nav-item">
            <span className="text-xs">Profile</span>
          </Link>
          <Link href="/packages" className="btm-nav-item">
            <span className="text-xs">Credits</span>
          </Link>
        </div>
      </SignedIn>
    </div>
  );
}
