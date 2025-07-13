import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AskPage() {
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
          <h1 className="heading-1 mb-4">Ask the Cards</h1>
          <p className="body-large text-neutral-content">
            Focus your intentions and ask your question
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card card-mystical mb-8">
            <div className="card-body">
              <h2 className="heading-3 mb-4">Your Question</h2>
              <textarea 
                className="textarea textarea-lg w-full" 
                placeholder="What guidance do you seek from the cards?"
                rows={4}
              />
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-mystical">
                  Draw Cards
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="body-small text-neutral-content">
              Take a moment to center yourself and focus on your question before drawing cards.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="btm-nav mobile-only">
        <Link href="/ask" className="btm-nav-item active">
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
    </div>
  );
}