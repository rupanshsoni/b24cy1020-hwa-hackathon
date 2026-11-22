import HeroScene from "@/components/sections/HeroScene";
import Explorer from "@/components/sections/Explorer";
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
      <HeroScene />
      <Explorer />
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
