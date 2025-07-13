import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
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
      <main className="content-container flex-1 pb-20 md:pb-6">
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-4">Reading History</h1>
          <p className="body-large text-neutral-content">
            Review your past tarot readings and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Placeholder for reading history cards */}
          <div className="card card-mystical">
            <div className="card-body">
              <h3 className="heading-3 mb-2">Love & Relationships</h3>
              <p className="body-small text-neutral-content mb-4">2 days ago</p>
              <p className="body-normal text-ellipsis-3">
                Your reading revealed insights about communication and trust in your current relationship...
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-outline btn-primary">View Full Reading</button>
              </div>
            </div>
          </div>

          <div className="card card-mystical">
            <div className="card-body">
              <h3 className="heading-3 mb-2">Career Path</h3>
              <p className="body-small text-neutral-content mb-4">1 week ago</p>
              <p className="body-normal text-ellipsis-3">
                The cards suggested a time of transformation and new opportunities ahead...
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-outline btn-primary">View Full Reading</button>
              </div>
            </div>
          </div>

          <div className="card card-mystical">
            <div className="card-body">
              <h3 className="heading-3 mb-2">Personal Growth</h3>
              <p className="body-small text-neutral-content mb-4">2 weeks ago</p>
              <p className="body-normal text-ellipsis-3">
                A powerful reading about self-discovery and inner strength...
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-outline btn-primary">View Full Reading</button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center mt-12">
          <p className="body-normal text-neutral-content mb-4">
            Ready for more insights?
          </p>
          <Link href="/ask" className="btn btn-primary">
            Ask the Cards
          </Link>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}