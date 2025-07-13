import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export default function PackagesPage() {
  const packages = [
    {
      name: "Starter Pack",
      credits: 3,
      price: "$4.99",
      description: "Perfect for exploring your first readings",
      features: ["3 detailed readings", "Basic interpretations", "Reading history"]
    },
    {
      name: "Explorer Pack",
      credits: 10,
      price: "$14.99",
      description: "Ideal for regular spiritual guidance",
      features: ["10 detailed readings", "Advanced interpretations", "Reading history", "Priority support"],
      popular: true
    },
    {
      name: "Mystic Pack",
      credits: 25,
      price: "$29.99",
      description: "For the dedicated spiritual seeker",
      features: ["25 detailed readings", "Premium interpretations", "Reading history", "Priority support", "Exclusive spreads"]
    }
  ];

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
          <h1 className="heading-1 mb-4">Credit Packages</h1>
          <p className="body-large text-neutral-content">
            Choose the perfect package for your spiritual journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, index) => (
            <div 
              key={index} 
              className={`card card-mystical ${pkg.popular ? 'ring-2 ring-primary' : ''} relative`}
            >
              {pkg.popular && (
                <div className="badge badge-primary absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </div>
              )}
              
              <div className="card-body">
                <h2 className="heading-3 text-center mb-2">{pkg.name}</h2>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                  <div className="body-small text-neutral-content">
                    {pkg.credits} credits
                  </div>
                </div>
                
                <p className="body-normal text-center mb-6 text-neutral-content">
                  {pkg.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center body-small">
                      <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="card-actions justify-center">
                  <button className={`btn w-full ${pkg.popular ? 'btn-primary' : 'btn-outline btn-primary'}`}>
                    Choose Package
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Credits */}
        <div className="card card-mystical max-w-md mx-auto mt-8">
          <div className="card-body text-center">
            <h3 className="heading-3 mb-2">Current Balance</h3>
            <div className="text-2xl font-bold text-primary mb-4">5 Credits</div>
            <p className="body-small text-neutral-content">
              Use your credits for detailed tarot readings
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="heading-2 text-center mb-6">Frequently Asked Questions</h2>
          
          <div className="collapse collapse-arrow bg-base-200 mb-2">
            <input type="radio" name="faq-accordion" />
            <div className="collapse-title font-medium">
              How do credits work?
            </div>
            <div className="collapse-content">
              <p>Each detailed tarot reading costs 1 credit. Credits never expire and can be used anytime.</p>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-200 mb-2">
            <input type="radio" name="faq-accordion" />
            <div className="collapse-title font-medium">
              Can I get a refund?
            </div>
            <div className="collapse-content">
              <p>We offer a 30-day money-back guarantee if you&apos;re not satisfied with your readings.</p>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="faq-accordion" />
            <div className="collapse-title font-medium">
              Are there any hidden fees?
            </div>
            <div className="collapse-content">
              <p>No hidden fees. The price you see is exactly what you pay, and credits never expire.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}