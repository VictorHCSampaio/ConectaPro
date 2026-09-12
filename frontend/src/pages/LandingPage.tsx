import { ContactSection } from '@/components/landing/ContactSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { TeamSection } from '@/components/landing/TeamSection'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-[#0a0a0a]">
      <SiteHeader />
      <main>
        <HeroSection />
        <HowItWorks />
        <TeamSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
