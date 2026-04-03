import React, { useState } from "react";
import { assets } from "./assets/assets";
import { display } from "./assets/display";

import Attractions from "./Attractions"
import Folklores from "./Folklores";
import TravelDiaries from "../../../components/TravelDiaries";
import Itineraries from "../../../components/Itineraries";
import HiddenGemsSection from "../../../components/HiddenGemsSection";
import TemplesGhats from "../../../components/TemplesGhats";
import Destination from "../../../components/Destination";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer"

const { slider1, slider2, slider3, slider4, slider5 } = assets;
const { display1, display2, display3, display4, display5 } = display;
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { motion } from 'framer-motion'
import SEOHead from "../../../components/SEOHead";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.25,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Agra = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <SEOHead
        title="Agra — India's Timeless Mughal Capital"
        description="Explore Agra, home of the iconic Taj Mahal, Agra Fort, and Fatehpur Sikri. Experience Mughal architecture, petha, and marble inlay craftsmanship."
        image="/destinations/agra.jpg"
      />
      <Navbar navLinks={[
        { label: "Attractions", href: "#attractions" },
        { label: "Folklore", href: "#folklore" },
        { label: "Itineraries", href: "#itineraries" },
        { label: "Hidden Gems", href: "#hidden-gems" },
        { label: "Travel Diaries", href: "#travel-diaries" },
        { label: "Temples & Ghats", href: "#temples-ghats" },
        { label: "Nearby", href: "#nearby" },
      ]} />


      {/* SWIPER SECTION */}
      <div className="w-screen h-[90vh] overflow-hidden relative mb-2">
        <Swiper
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          effect="fade"
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          className="w-full h-full">
          {[slider1, slider2, slider3, slider4, slider5].map((src, i) => (
            <SwiperSlide key={i} className="relative">
              <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-black/70 z-20"></div>

              <img
                src={src}
                alt={`Slide ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Hero Text */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-white z-30">
          <h1 className="text-5xl font-extrabold drop-shadow-lg tracking-wide">
            Welcome to Agra
          </h1>
          <p className="text-lg mt-2 text-gray-200 drop-shadow-md">
            Where history, art & romance live forever
          </p>
        </div>
      </div>

      {/*Main container for information section*/}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
        className="px-8 lg:px-24 py-16">
        <motion.h1 variants={childVariants} className="text-5xl font-bold mb-6 text-gray-900">
          Agra: India's Timeless Mughal Capital</motion.h1>
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* LEFT SECTION*/}
          <motion.div
            variants={childVariants}
            className="w-full lg:w-[60%] text-gray-700 text-lg sm:text-xl leading-relaxed space-y-6"
          >
            <div className="text-xl leading-relaxed text-gray-700 pr-10 pt-10">
              Agra is much more than the city of the Taj Mahal; it is the historic soul of India, resting gracefully on the banks of the Yamuna River. This city in Uttar Pradesh was the glorious capital of the powerful Mughal Empire, and its legacy of luxury and power is preserved in its magnificent architecture. Agra is an essential destination for a deeply moving journey through centuries of rich culture and artistic excellence.
              <div className="m-5"></div>
              The magnificence of Agra lies in its UNESCO World Heritage Sites, often called the city’s ‘Golden Trio.’ The Taj Mahal, the white marble mausoleum built as the ultimate symbol of eternal love, is the universal highlight. Its perfect symmetry and radiant beauty make it an unforgettable sight. Just a short distance away stands the Agra Fort, a vast, imposing red sandstone structure that served as the primary residence and political center of the emperors. Exploring its palaces offers a direct look into the empire’s strategic power. The deserted city of Fatehpur Sikri, built by Emperor Akbar, completes the trio. Its beautifully preserved courtyards and grand gates showcase incredibly detailed artistry and planning.
              <div className="m-5"></div>
              To experience the city’s true charm, step away from the grand sites and explore the lively bazaars. These markets are perfect for finding authentic marble inlay crafts—replicas of the work on the Taj—along with quality leather goods and traditional textiles. The local food is a must-try; Agra is famous for its iconic sweet treat, petha, and its rich, flavorful Mughlai cuisine.
              <div className="m-5"></div>
              For the best travel experience, plan your visit between October and March when the weather is cool and pleasant. Agra is well-connected and easily navigable, promising a premium travel memory filled with history and timeless wonder.
            </div>
          </motion.div>

          {/* RIGHT SECTION (40%) */}
          <div className="lg:w-[40%] w-full bg-gray-100 p-5 rounded-xl shadow-lg self-start mt-8">
            <h2 className="text-2xl font-semibold mb-5">Quick Facts</h2>

            <div className="grid grid-cols-2 gap-x-4 mb-6 text-gray-700 text-base">
              <ul className="space-y-1">
                <li><strong>January:</strong> 7°C – 20°C</li>
                <li><strong>February:</strong> 10°C – 25°C</li>
                <li><strong>March:</strong> 15°C – 30°C</li>
                <li><strong>April:</strong> 22°C – 38°C</li>
                <li><strong>May:</strong> 28°C – 45°C</li>
                <li><strong>June:</strong> 30°C – 43°C</li>
              </ul>

              <ul className="space-y-1">
                <li><strong>July:</strong> 28°C – 38°C</li>
                <li><strong>August:</strong> 27°C – 35°C</li>
                <li><strong>September:</strong> 25°C – 34°C</li>
                <li><strong>October:</strong> 20°C – 32°C</li>
                <li><strong>November:</strong> 14°C – 28°C</li>
                <li><strong>December:</strong> 8°C – 22°C</li>
              </ul>
            </div>

            {/* ✈️ AIRPORTS */}
            <h3 className="text-lg font-semibold mt-4 mb-2">Airports</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-4">
              <li>🛫 Dindayal International Airport (Agra)</li>
              <li>🛫 Indira Gandhi International Airport (New Delhi)</li>
            </ul>

            {/* 🚆 RAILWAY STATIONS */}
            <h3 className="text-lg font-semibold mt-4 mb-2">Railway Stations</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-4">
              <li>🚆 Agra Cantt Railway Station</li>
              <li>🚆 Agra Fort Railway Station</li>
              <li>🚆 Agra City Railway Station</li>
              <li>🚆 Raja Ki Mandi Railway Station</li>
            </ul>

            {/* 🗓️ BEST TIME + CLIMATE */}
            <h3 className="text-lg font-semibold mt-4 mb-2">Best Time & Climate</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-6">
              <li><strong>Best Time to Visit:</strong> October – March</li>
              <li><strong>Climate:</strong> Semi-arid with hot summers</li>
            </ul>

            {/* 🗺️ GOOGLE MAP EMBED */}
            <div className="w-full h-[250px] bg-gray-200 rounded-lg overflow-hidden mb-4">
              <iframe
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14261.685403088214!2d78.008074!3d27.176670!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974771e5aaff179%3A0xcee4d44fe7bd990!2sTaj%20Mahal!5e0!3m2!1sen!2sin!4v1700000000000"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        {showMore && (
          <div className="mt-4 text-xl text-gray-700 leading-loose pt-[25px] space-y-16">

            {/* ⭐ SECTION: A Journey Through Agra */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">A journey through Agra's glorious past</h2>
              <div>
                Agra isn’t just a city—it’s a living museum of empires, artistry, and timeless poetry carved in stone.
                Walk through mughal courts, lose yourself at the Taj, and feel stories whisper from every carved arch.
                Start with the Taj, then let the city lead you to red-sandstone forts, hidden workshops, and street-food alleys
                that form the heartbeat of Agra.
              </div>
            </div>

            {/* ⭐ SECTION: Architectural Marvels */}
            <div className="space-y-10">
              <h3 className="text-3xl font-bold">Architectural Marvels of Agra</h3>

              {/* ⭐ Taj Mahal → 70% text left, 30% image right */}
              <div className="flex flex-col lg:flex-row gap-10">

                {/* TEXT – 70% */}
                <div className="lg:w-[70%] space-y-4">
                  <h4 className="text-2xl font-semibold">Taj Mahal: The Crown of India</h4>
                  <div>
                    The Taj Mahal is not merely a monument—it’s an immersive experience that stays etched in your memory. As you step through the towering gateway, the pristine white marble structure reveals itself, feeling almost unreal, like you’ve walked into a dream. Every breeze carries centuries of whispers, every arch frames a perfect view, and every detail shines with the devotion of artisans who worked their entire lives on this monument of love. Its flawless symmetry and the luminous quality of the marble are breathtaking.
                    <div className="m-5"></div>
                    Whether you visit at sunrise, sunset, or under the silver glow of a full moon, the Taj Mahal transforms with the sky—soft pinks, glowing golds, and radiant white. Commissioned by Emperor Shah Jahan for his queen, Mumtaz Mahal, it remains the ultimate expression of devotion. No visit to India is complete without witnessing this monument that feels alive, poetic, and timeless.
                  </div>
                </div>

                {/* IMAGE – 30% */}
                <div className="lg:w-[30%]">
                  <img src={display1} alt="taj-mahal"
                    className="w-full h-[90%] object-cover rounded-xl shadow-lg" />
                </div>
              </div>

              {/* ⭐ Agra Fort → reverse (30% image left, 70% text right) */}
              <div className="flex flex-col lg:flex-row-reverse gap-8">

                {/* TEXT – 70% */}
                <div className="lg:w-[70%] space-y-4">
                  <h4 className="text-2xl font-semibold">Agra Fort: The Throne of Power</h4>
                  <div>
                    A short drive from the Taj stands Agra Fort, a colossal red sandstone fortress where empires were born, alliances were forged, and destinies were rewritten. This fort isn’t just a structure—it’s a world within walls.
                    Inside, you’ll find palaces carved with intricate patterns, airy pavilions and secret alleys echoing with stories
                    long forgotten. Imagine the vibrant courts of Akbar, the intellectual brilliance of Jahangir, and the sorrowful
                    final years of Shah Jahan spent gazing at the Taj Mahal from Musamman Burj.
                    <div className="m-5"></div>
                    Every stone here holds a story—of power, love, betrayal, and longing.
                    As you walk through Diwan-i-Khas, Diwan-i-Aam, Jahangiri Mahal, and the shimmering marble courtyards,
                    you’ll feel the grandeur of the Mughal era come alive. The fort’s architecture blends Hindu, Persian,
                    and Islamic elements, showcasing the empire’s inclusiveness and artistic genius.
                    Agra Fort is not just a monument—it’s an epic saga waiting to be felt.
                  </div>
                </div>

                {/* IMAGE – 30% */}
                <div className="lg:w-[30%]">
                  <img src={display2} alt="agra-fort"
                    className="w-full h-full object-cover rounded-xl shadow-lg" />
                </div>
              </div>
            </div>

            {/* ⭐ SECTION: Cuisine & Crafts */}
            <div className="space-y-12">
              <h3 className="text-3xl font-bold">Flavours & crafts that make Agra unforgettable</h3>

              {/* ⭐ Bhedai → 70 text + 30 image */}
              <div className="flex flex-col lg:flex-row gap-8">

                {/* TEXT – 70% */}
                <div className="lg:w-[70%] space-y-4">
                  <div>
                    Ara’s culinary scene is as rich and layered as its history. The city welcomes you with aromas of freshly fried Bhedai Kachori, simmering sabzi, sweet Petha, and the unmistakable crunch of Dal Moth. Every bite here feels like an emotion—warm, nostalgic, and deeply rooted in Agra’s culture. Beyond the Mughal royalty, the local cuisine perfectly captures the spirit of the city’s vibrant street life. This gastronomic journey is as essential as seeing the monuments.

                    Begin your food journey with Bhedai & Sabzi, Agra’s classic breakfast. The crisp, golden kachori paired with spicy potato sabzi is comfort food at its finest, giving you the energy needed for a day of sightseeing. As you explore the streets, try the legendary Petha—soft, translucent, and infused with exquisite flavours like kesar, paan, and coconut. This famous sweet is a delicious reminder of traditional artistry. Grab a packet of Dal Moth too—a crunchy, tangy lentil mix that makes the perfect souvenir.
                  </div>
                </div>

                {/* IMAGE – 30% */}
                <div className="lg:w-[30%]">
                  <img src={display3} alt="bedai"
                    className="w-full h-[] object-cover rounded-xl shadow-lg" />
                </div>
              </div>

              {/* ⭐ Marble Inlay + Footwear → Text + two side-by-side images */}
              <div className="space-y-4">
                <div>
                  Agra isn’t just about flavours—it’s a treasure house of craftsmanship. The city is renowned for its extraordinary marble inlay work, the same art that adorns the Taj Mahal. Visit local workshops to watch artisans shape marble
                  into intricate patterns, placing tiny semi-precious stones with unbelievable precision.
                  Agra is also one of India’s largest footwear hubs. Entire neighbourhoods buzz with craftsmen cutting, stitching,
                  and polishing leather shoes. A walk inside a shoe factory reveals the passion and skill behind the city’s famous
                  juttis and leather footwear.
                </div>

                {/* Two images side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <img src={display4} alt="marble-inlay"
                    className=" h-[350px] object-cover rounded-xl shadow-lg" />
                  <img src={display5} alt="footwear"
                    className=" h-[350px] object-cover rounded-xl shadow-lg" />
                </div>
              </div>
              <div className="bg-gray-100 p-8 rounded-xl">
                <h3 className="font-bold text-2xl pb-3">Agra : A city that stays with you</h3>
                <div className="text-lg">The Taj is only the beginning. Roam the forts, bargain in bazaars, taste street delights, and let the city carve a memory you’ll carry home. Plan for spring or autumn for perfect weather and the clearest views.</div>
                <div className="mt-4">
                  {/* to your ai agent button */}
                  <a href="/create-trip" className="btn-primary mr-6">Plan your Visit</a>
                  {/* to your experiences button */}
                  <a href="#" className="btn-secondary">See Experiences</a>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-3xl pb-3">Explore Agra Beyond the Usual Tourist Path</h3>
                <div>Agra isn't just about its grand monuments—it's about the little discoveries you make along the way. Venture into the narrow lanes near Jama Masjid where the aroma of freshly baked sheermal fills the evening air. Watch craftsmen carve marble using techniques passed down for generations, or simply sit by the riverside ghats at dawn, where the city awakens gently with temple bells and soft sunlight.
                  <div className="m-5"></div>
                  For photography lovers, the old city offers irresistible frames—vintage havelis, colourful spice shops, early-morning chai stalls, and age-old mosques with exquisite domes. Walk through Mantola Road or the lanes of Kinari Bazaar and you’ll see Agra raw, real, and full of life. Every corner feels like a story unfolding.
                  <div className="m-5"></div>
                  If you’re seeking calm, visit the peaceful gardens near Ram Bagh, believed to be one of the earliest Mughal gardens in India. Sunset here feels like stepping into a painting, with soft light bouncing off ancient pavilions. Another unique experience is exploring the Yamuna riverbank trails—perfect for long, quiet walks while watching the Taj Mahal glow from a distance.</div>
              </div>
              <div>
                <h3 className="text-3xl font-bold pb-3">The Heart of Agra: Its People & Culture</h3>
                <div>Agra’s magic comes alive through its people—warm, lively, and always ready to share their city’s stories. Whether it's a shopkeeper offering you a taste of freshly made petha or an artisan proudly showing the inlay work he's been perfecting since childhood, every interaction adds to your experience.

                  Locals will often guide you to hidden gems: rooftop cafés with breathtaking Taj views, old workshops where artisans hammer out brass designs, or small eateries serving Mughlai dishes that taste like family secrets. Every place feels personal, familiar, and unforgettable. This is what makes Agra more than just a travel destination—it becomes a feeling you carry with you.</div>
              </div>
            </div>
          </div>
        )}

        {/* READ MORE BUTTON */}
        <div className="mt-8">
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            {showMore ? "Read Less" : "Read More"}
          </button>
        </div>

      </motion.div>{/* closing INFORMATION section */}

      {/* Attractions Section */}
      <div id="attractions"><Attractions /></div>
      <div id="folklore"><Folklores /></div>
      <div id="travel-diaries"><TravelDiaries /></div>
      <div id="itineraries"><Itineraries /></div>
      <div id="hidden-gems"><HiddenGemsSection city="agra" /></div>
      <div id="temples-ghats"><TemplesGhats city="agra" /></div>
      <div id="nearby"><Destination excludeCity="Agra" headingOverride="NEARBY" /></div>
      <Footer />
    </div >
  );
};

export default Agra;



