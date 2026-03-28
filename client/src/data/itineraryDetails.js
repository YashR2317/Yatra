const itineraries = {
    agra: {
        city: "Agra",
        tagline: "Where Mughal grandeur meets living heritage",
        heroImage: "/destinations/agra.jpg",
        days: [
            {
                day: 1,
                title: "Monuments & Mughal Legacy",
                slots: {
                    morning: "Start at the Taj Mahal at sunrise for the softest light and smallest crowds. Spend 2 hours exploring the main mausoleum, gardens, and the mosque.",
                    afternoon: "Visit Agra Fort — walk through the Diwan-i-Khas, Musamman Burj, and Jahangiri Mahal. Break for lunch at a rooftop café with Taj views.",
                    evening: "Head to Mehtab Bagh across the Yamuna for a stunning sunset view of the Taj's silhouette reflected in the river.",
                },
            },
            {
                day: 2,
                title: "Hidden Heritage & Local Flavours",
                slots: {
                    morning: "Explore Itmad-ud-Daula (Baby Taj) — intricate marble lattice work, fewer crowds. Then visit Chini Ka Rauza nearby.",
                    afternoon: "Wander through Kinari Bazaar and Sadar Bazaar for petha, marble inlay souvenirs, and leather goods. Lunch on Bedai-Jalebi at a local dhaba.",
                    evening: "Visit Mankameshwar Temple and the Yamuna ghats. Watch the riverside come alive as evening prayers begin.",
                },
            },
            {
                day: 3,
                title: "Day Trip & Farewell",
                slots: {
                    morning: "Drive to Fatehpur Sikri (40 km) — explore Buland Darwaza, Panch Mahal, and the tomb of Sheikh Salim Chishti.",
                    afternoon: "Return to Agra for lunch. Visit Ram Bagh, the oldest Mughal garden, for a quiet stroll.",
                    evening: "Final visit to the Taj Mahal area for evening views. Pick up last-minute petha and dalmoth for the journey home.",
                },
            },
        ],
        tips: {
            bestSeason: "October to March — cool, pleasant weather and clear skies",
            transport: "Auto-rickshaws and cycle-rickshaws are the best way to get around. Pre-paid autos available at major sites.",
            dressCode: "Modest clothing for religious sites. Comfortable walking shoes are essential.",
            whatToCarry: "Sunscreen, water bottle, hat for daytime visits. Camera — photography is allowed at most sites except inside temples.",
        },
    },
    mathura: {
        city: "Mathura",
        tagline: "Walk where Krishna walked",
        heroImage: "/destinations/mathura.jpg",
        days: [
            {
                day: 1,
                title: "Sacred Sites & Temple Trail",
                slots: {
                    morning: "Begin at Krishna Janmabhoomi Temple — attend the morning aarti and explore the prison cell where Krishna was born.",
                    afternoon: "Visit Dwarkadhish Temple for its ornate architecture and devotional atmosphere. Lunch at a local sweet shop — pedas are mandatory.",
                    evening: "Head to Vishram Ghat for the spectacular evening Yamuna aarti — oil lamps floating on the river, bells, and chants.",
                },
            },
            {
                day: 2,
                title: "Ghats, Museums & Markets",
                slots: {
                    morning: "Walk along the Yamuna ghats — Vishram Ghat, Kans Qila Ghat, Swami Ghat. Take a boat ride at sunrise.",
                    afternoon: "Visit the Government Museum to see Mathura School sculptures from the Kushan period. Explore the Gita Mandir.",
                    evening: "Stroll through Holi Gate market for bangles, incense, and Krishna souvenirs. End with lassi and samosas.",
                },
            },
            {
                day: 3,
                title: "Surrounding Sacred Towns",
                slots: {
                    morning: "Day trip to Gokul (15 km) — visit Nand Bhavan, Brahmand Ghat, and Raman Reti.",
                    afternoon: "Drive to Vrindavan (12 km) — visit Banke Bihari Temple, Prem Mandir, and ISKCON during afternoon darshan.",
                    evening: "Return to Mathura for a farewell dinner. Pick up pedas and rabri for home.",
                },
            },
        ],
        tips: {
            bestSeason: "October to March; visit during Janmashtami (Aug-Sep) or Holi (Feb-Mar) for festivals",
            transport: "Auto-rickshaws, e-rickshaws available everywhere. Mathura Junction is the main railway station.",
            dressCode: "Conservative clothing at temples. Remove shoes before entering. Head covering recommended at some shrines.",
            whatToCarry: "Comfortable walking shoes, small change for donations, camera (no photography inside some temples).",
        },
    },
    vrindavan: {
        city: "Vrindavan",
        tagline: "5000 temples, one divine love story",
        heroImage: "/destinations/vrindavan.webp",
        days: [
            {
                day: 1,
                title: "The Great Temples",
                slots: {
                    morning: "Start early at Banke Bihari Temple for the powerful morning darshan. Then visit Radha Raman Temple.",
                    afternoon: "Explore ISKCON Vrindavan — the Krishna-Balaram Mandir, museum, and restaurant. Lunch at Govinda's.",
                    evening: "Visit Prem Mandir as it illuminates at sunset — a breathtaking spectacle of white marble and coloured lights.",
                },
            },
            {
                day: 2,
                title: "Mystery & Mysticism",
                slots: {
                    morning: "Visit Nidhivan — the mysterious grove. Then Seva Kunj, where Radha-Krishna's midnight dance is believed to occur.",
                    afternoon: "Explore the old-town temples: Madan Mohan (hilltop views), Radha Damodara (Rupa Goswami's samadhi), Shahji Temple.",
                    evening: "Attend the Yamuna aarti at Kesi Ghat — one of the most atmospheric evening rituals in all of Braj.",
                },
            },
            {
                day: 3,
                title: "Parikrama & Hidden Vrindavan",
                slots: {
                    morning: "Do the Vrindavan Parikrama — a walking circuit of the town visiting smaller temples and sacred spots.",
                    afternoon: "Visit Jai Singh Ghewar Math and Vrinda Kund — hidden gems known only to serious pilgrims.",
                    evening: "Final darshan at Banke Bihari. Shopping for tulsi malas, Krishna idols, and prasad in the temple lanes.",
                },
            },
        ],
        tips: {
            bestSeason: "October to March; Janmashtami and Holi are spectacular",
            transport: "E-rickshaws are the primary transport. Walking is the best way to experience the narrow temple lanes.",
            dressCode: "Modest traditional clothing strongly recommended. Several temples have strict dress codes.",
            whatToCarry: "Slip-on shoes (you'll remove them often), small bag for prasad, camera (respect no-photography zones).",
        },
    },
    gokul: {
        city: "Gokul",
        tagline: "The cradle of Krishna's childhood",
        heroImage: "/destinations/gokul.jpg",
        days: [
            {
                day: 1,
                title: "Krishna's Childhood Trail",
                slots: {
                    morning: "Visit Nand Bhavan — the palace of Krishna's foster parents. See the recreated scenes from his childhood.",
                    afternoon: "Walk to Brahmand Ghat — where baby Krishna showed the universe in his mouth. Take a quiet moment by the Yamuna.",
                    evening: "Explore Raman Reti — walk barefoot on the sacred sand and attend the evening aarti at the main temple.",
                },
            },
            {
                day: 2,
                title: "Temples & Riverside",
                slots: {
                    morning: "Visit Thakurani Ghat and the 84 Khamba Temple. Early morning is magical here — nearly deserted.",
                    afternoon: "Explore Nandishwar Mahadeva Temple and Dauji Temple. Lunch at a simple local eatery.",
                    evening: "Sunset by the Yamuna Ghat — one of the most peaceful sunset experiences in Braj.",
                },
            },
            {
                day: 3,
                title: "Surrounding Area",
                slots: {
                    morning: "Day trip to Mahavan — the ancient twin town of Gokul with the Nand Qila and Chaurasi Khamba temple.",
                    afternoon: "Visit Baldeo (Dauji) — the Balarama temple with its famous holy tank.",
                    evening: "Return to Gokul for final prayers and a quiet farewell walk along the river.",
                },
            },
        ],
        tips: {
            bestSeason: "October to March; Janmashtami celebrations are deeply authentic here",
            transport: "Auto-rickshaws from Mathura (15 km). Local transport is limited — arrange a vehicle for day trips.",
            dressCode: "Simple, modest clothing. The town is deeply traditional.",
            whatToCarry: "Water, snacks (limited food options), comfortable walking shoes, cash (limited ATMs).",
        },
    },
    barsana: {
        city: "Barsana",
        tagline: "Radha's eternal kingdom of love and colour",
        heroImage: "/destinations/barsana.jpeg",
        days: [
            {
                day: 1,
                title: "The Sacred Hills",
                slots: {
                    morning: "Climb to Radha Rani Temple (Shreeji Mandir) for the sunrise darshan — breathtaking views from the hilltop.",
                    afternoon: "Visit Maan Garh — the hill where Radha sulked. Panoramic views of the Braj countryside. Lunch at a local dhaba.",
                    evening: "Explore the Lathmar Holi ground area and the colourful lanes of old Barsana.",
                },
            },
            {
                day: 2,
                title: "Temples & Groves",
                slots: {
                    morning: "Visit Daan Garh Temple — the site of Krishna's playful tax-collection. Then Mor Kutir, the peacock garden.",
                    afternoon: "Explore Sanket Van, the secret meeting grove. Walk the beginning of the Barsana Parikrama Path.",
                    evening: "Attend the evening aarti at the main temple complex. The devotional songs echo across the hills.",
                },
            },
            {
                day: 3,
                title: "Hidden Barsana & Surroundings",
                slots: {
                    morning: "Visit Chiksauli village and Vrishabhanu Kund — the sacred pond of Radha's father.",
                    afternoon: "Continue the Parikrama Path or drive to Nandgaon (8 km) — Krishna's village with its own hilltop temple.",
                    evening: "Final darshan at Radha Rani Temple. Pick up ladoo prasad for home.",
                },
            },
        ],
        tips: {
            bestSeason: "October to March; visit during Holi week (Feb-Mar) for the legendary Lathmar Holi",
            transport: "Barsana is 50 km from Mathura. Hire a car or take a shared auto from Mathura Junction.",
            dressCode: "Modest, traditional clothing. The hilltop climb is steep — wear comfortable footwear.",
            whatToCarry: "Water bottle, hat, sunscreen, cash. Energy snacks for the hill climb.",
        },
    },
    govardhan: {
        city: "Govardhan",
        tagline: "The sacred hill that Krishna held aloft",
        heroImage: "/destinations/govardhan.jpg",
        days: [
            {
                day: 1,
                title: "Govardhan Parikrama",
                slots: {
                    morning: "Begin the 21 km Govardhan Parikrama early morning. Start from Manasi Ganga and walk barefoot (or in simple footwear) along the trail.",
                    afternoon: "Complete the parikrama, passing through Radha Kund, Shyam Kund, and Kusum Sarovar. Lunch at a dharamshala midway.",
                    evening: "Rest and visit Mukharavind Temple — the 'face' of Govardhan Hill. Evening aarti is deeply moving.",
                },
            },
            {
                day: 2,
                title: "Sacred Sites of Govardhan",
                slots: {
                    morning: "Visit Daan Ghati Temple — the cave temple where Krishna collected tax from gopis. Explore nearby shrines.",
                    afternoon: "Spend time at Manasi Ganga — take a peaceful walk around the mind-born lake. Visit nearby temples.",
                    evening: "Visit Radha Kund and Shyam Kund for the evening lamp ceremony. The twin kunds are hauntingly beautiful at dusk.",
                },
            },
            {
                day: 3,
                title: "Surrounding Braj",
                slots: {
                    morning: "Visit Kusum Sarovar — the octagonal step-well is gorgeous in morning light.",
                    afternoon: "Day trip to Barsana (20 km) for Radha Rani Temple, or to Vrindavan (25 km) for the major temples.",
                    evening: "Return for a quiet final circumambulation of Govardhan — many pilgrims do a shorter evening round.",
                },
            },
        ],
        tips: {
            bestSeason: "October to March; the Annakut festival after Diwali is a spectacular experience",
            transport: "Govardhan is 25 km from Mathura. Hire a car or take a shared auto. The parikrama is on foot.",
            dressCode: "Simple, modest clothing. Many pilgrims walk barefoot on the parikrama path.",
            whatToCarry: "Sturdy, simple footwear, water bottle, energy snacks, sunscreen. Cash for donations and local food stalls.",
        },
    },
};

export default itineraries;
