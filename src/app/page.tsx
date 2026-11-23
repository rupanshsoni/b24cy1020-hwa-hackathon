import HeroScene from "@/components/sections/HeroScene";
import Explorer from "@/components/sections/Explorer";
import Science from "@/components/sections/Science";
import Comparison from "@/components/sections/Comparison";
import TryPawVault from "@/components/sections/TryPawVault";
import Reviews from "@/components/sections/Reviews";
import Faq from "@/components/sections/Faq";
import Configurator from "@/components/sections/Configurator";
import Mission from "@/components/sections/Mission";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <HeroScene />
      <Explorer />
      <Science />
      <Comparison />
      <TryPawVault />
      <Reviews />
      <Faq />
      <Configurator />
      <Mission />
      <Contact />
    </main>
  );
}
