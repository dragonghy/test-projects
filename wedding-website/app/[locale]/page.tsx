import Hero from "@/components/Hero";
import OurStory from "@/components/OurStory";
import WeddingInfo from "@/components/WeddingInfo";
import Schedule from "@/components/Schedule";
import GalleryPreview from "@/components/GalleryPreview";
import Guestbook from "@/components/Guestbook";

export default function HomePage() {
  return (
    <>
      <Hero />
      <OurStory />
      <WeddingInfo />
      <Schedule />
      <GalleryPreview />
      <Guestbook />
    </>
  );
}
