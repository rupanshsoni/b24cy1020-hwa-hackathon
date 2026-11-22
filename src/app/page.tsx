import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Configurator from "@/components/sections/Configurator";
import Science from "@/components/sections/Science";
import Comparison from "@/components/sections/Comparison";
import Mission from "@/components/sections/Mission";
import Reviews from "@/components/sections/Reviews";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Configurator />
      <Science />
      <Comparison />
      <Mission />
      <Reviews />
      <Faq />
      <Contact />
    </main>
  );
}
