import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import PainPoints from './sections/PainPoints';
import AiTeam from './sections/AiTeam';
import HowItWorks from './sections/HowItWorks';
import Pricing from './sections/Pricing';
import Testimonials from './sections/Testimonials';
import Faq from './sections/Faq';
import CtaBanner from './sections/CtaBanner';
import Footer from './sections/Footer';

export default function App() {
  return (
    <div>
      <Navigation />
      <Hero />
      <PainPoints />
      <AiTeam />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  );
}
