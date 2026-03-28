import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";

const tours = [
  {
    slug: "mariam-tomb",
    name: "Tomb of Mariam-uz-Zamani",
    description: "Explore the tomb of Akbar's wife, a stunning blend of Hindu and Mughal architecture.",
    image: "/tours/mariam-tomb/1.1.jpg",
  },
  {
    slug: "sikandra",
    name: "Tomb of Akbar the Great",
    description: "Walk through the grand mausoleum of Emperor Akbar at Sikandra.",
    image: "/tours/sikandra/1.1.jpg",
  },
  {
    slug: "itmad",
    name: "Tomb of Itmad-ud-Daulah",
    description: "Discover the 'Baby Taj' — a jewel box of Mughal craftsmanship on the Yamuna.",
    image: "/tours/itmad/3.1.jpg",
  },
  {
    slug: "aram",
    name: "Aram Bagh",
    description: "Stroll through the earliest Mughal garden in India, built by Emperor Babur.",
    image: "/tours/aram/1.jpg",
  },
  {
    slug: "chini-ka-rauza",
    name: "Chini Ka Rauza",
    description: "Visit the glazed-tile tomb of Afzal Khan, Mughal Prime Minister under Shah Jahan.",
    image: "/tours/chini-ka-ruaza/1.jpg",
  },
];

export default function VirtualToursIndex() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/home-page.png')" }}
      />
      <div className="absolute inset-0 bg-black/80" />

      <Navbar autoHide />

      {/* Content */}
      <div className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide mb-4">
            Virtual Heritage Tours
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore Agra's magnificent Mughal monuments through immersive 360° virtual tours.
            Walk through history from anywhere in the world.
          </p>
        </motion.div>

        {/* Tour Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, i) => (
            <motion.div
              key={tour.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate(`/virtual-tours/${tour.slug}`)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/40 transition-all duration-500 shadow-xl hover:shadow-amber-500/10"
            >
              {/* Image */}
              <div className="h-52 overflow-hidden relative">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold tracking-wider uppercase">
                  360° Tour
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {tour.name}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {tour.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <span>Start Tour</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
