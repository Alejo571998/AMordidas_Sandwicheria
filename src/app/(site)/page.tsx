import { Hero } from "@/components/home/Hero";
import { HowToOrder } from "@/components/home/HowToOrder";
import { Marquee } from "@/components/home/Marquee";
import { StorySection } from "@/components/home/StorySection";
import { MenuSection } from "@/components/menu/MenuSection";
import { getMenu } from "@/lib/catalog";
import { buildRestaurantJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const menu = await getMenu();
  const jsonLd = buildRestaurantJsonLd(menu);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <Marquee />
      <MenuSection />
      <StorySection />
      <HowToOrder />
    </>
  );
}
