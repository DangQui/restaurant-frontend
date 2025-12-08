import HeroSection from '@/features/home/HeroSection/HeroSection'
import PopularSection from '@/features/home/PopularSection/PopularSection'
import MenuSection from '@/features/home/MenuSection/MenuSection'
import VisitSection from '@/features/home/VisitSection/VisitSection'
import OffersSection from '@/features/home/OffersSection/OffersSection'
import ServicesRibbon from '@/features/home/ServicesRibbon/ServicesRibbon'
import ChefSection from '@/features/home/ChefSection/ChefSection'
import ArticlesSection from '@/features/home/ArticlesSection/ArticlesSection'
import NewsletterSection from '@/features/home/NewsletterSection/NewsletterSection'

import { useHomeScrollMemory } from '@/hooks/useHomeScrollMemory'

const HomePage = () => {
  useHomeScrollMemory()

  return (
    <>
      <HeroSection />
      <PopularSection />
      <MenuSection />
      <VisitSection />
      <OffersSection />
      <ServicesRibbon />
      <ChefSection />
      <ArticlesSection />
      <NewsletterSection />
    </>
  )
}

export default HomePage


