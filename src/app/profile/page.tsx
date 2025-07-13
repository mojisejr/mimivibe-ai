import { UserButton, currentUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default async function ProfilePage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/* Header */}
      <header className="navbar bg-base-100/90 backdrop-blur-sm shadow-lg">
        <div className="navbar-start">
          <Link href="/" className="text-2xl font-bold text-primary">MiMiVibes</Link>
        </div>
        <div className="navbar-end">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container">
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-4">Your Profile</h1>
          <p className="body-large text-neutral-content">
            Manage your spiritual journey and account settings
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* User Info Card */}
          <div className="card card-mystical">
            <div className="card-body">
              <h2 className="heading-3 mb-4">Account Information</h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="avatar">
                  <div className="w-16 rounded-full">
                    <Image 
                      src={user?.imageUrl || "/api/placeholder/64/64"} 
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-neutral-content">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credits Card */}
          <div className="card card-mystical">
            <div className="card-body">
              <h2 className="heading-3 mb-4">Reading Credits</h2>
              <div className="flex justify-between items-center mb-4">
                <span className="body-large">Available Credits:</span>
                <span className="text-2xl font-bold text-primary">5</span>
              </div>
              <div className="card-actions justify-end">
                <Link href="/packages" className="btn btn-primary">
                  Buy More Credits
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="card card-mystical">
            <div className="card-body">
              <h2 className="heading-3 mb-4">Your Journey</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">12</div>
                  <div className="body-small text-neutral-content">Total Readings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">7</div>
                  <div className="body-small text-neutral-content">Days Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="card card-mystical">
            <div className="card-body">
              <h2 className="heading-3 mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Email notifications</span>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Daily reading reminders</span>
                    <input type="checkbox" className="toggle toggle-primary" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="btm-nav mobile-only">
        <Link href="/ask" className="btm-nav-item">
          <span className="text-xs">Ask</span>
        </Link>
        <Link href="/history" className="btm-nav-item">
          <span className="text-xs">History</span>
        </Link>
        <Link href="/profile" className="btm-nav-item active">
          <span className="text-xs">Profile</span>
        </Link>
        <Link href="/packages" className="btm-nav-item">
          <span className="text-xs">Credits</span>
        </Link>
      </div>
    </div>
  );
}