(function () {

    const TRANSLATIONS = {
        en: {
            logo_sub: 'Hare Krishna Â· AI Tirth Companion',
            new_chat: 'New Chat',
            quick_actions: 'ðŸª· Quick Actions',
            plan_yatra: 'Plan Yatra (Questionnaire)',
            darshan_guide: 'Temple Darshan Guide',
            weather: 'Weather',
            krishna_leela: 'Krishna Leela & History',
            prasadam: 'Prasadam & Food',
            parikrama: 'Braj Parikrama',
            connecting: 'Connecting...',
            welcome_title: 'BRAJYATRA.AI',
            welcome_tagline: 'Where Travel meets Tradition',
            welcome_desc: 'Your AI-powered Tirth Companion for the sacred Braj Dham â€” walk the land where Shri Krishna performed His divine leelas.',
            card_plan: 'Plan Your Yatra',
            card_plan_desc: 'Custom itinerary with preferences',
            card_darshan: 'Temple Darshan',
            card_darshan_desc: 'Sacred temples & divine darshan',
            card_festivals: 'Festivals & Events',
            card_festivals_desc: 'Sacred festivals & celebrations',
            card_parikrama: 'Parikrama Guide',
            card_parikrama_desc: 'Sacred circumambulation routes',
            input_placeholder: 'Ask about Braj Dham, plan a Yatra...',
            input_hint: 'BrajYatra Â· Plan Yatra Â· Darshan Guide Â· Weather Â· Krishna Leelas',
            modal_title: 'Plan Your Sacred Yatra',
            modal_desc: 'Tell us your preferences for a personalized itinerary',
            q1_title: 'ðŸ™ Yatra Type',
            q1_desc: 'What kind of journey calls to your soul?',
            q1_opt1: 'Tirth Yatra',
            q1_opt1_desc: 'Sacred pilgrimage & temple darshan',
            q1_opt2: 'Cultural Tour',
            q1_opt2_desc: 'Culture, heritage & monuments',
            q1_opt3: 'Complete Braj Yatra',
            q1_opt3_desc: 'Complete tour â€” temples, heritage & nature',
            q1_opt4: 'Custom Mix',
            q1_opt4_desc: "I'll pick my own interests",
            q2_title: 'ðŸ“… Yatra Duration',
            q2_desc: 'How many days for your sacred journey?',
            q3_title: 'ðŸ“ Sacred Destinations',
            q3_desc: 'Select the holy cities you wish to visit',
            q4_title: 'ðŸª· Your Interests',
            q4_desc: 'What experiences are you seeking? (Select multiple)',
            int_temple: 'ðŸ›• Temple Darshan',
            int_ghat: 'ðŸŒŠ Ghat & Holy Bath',
            int_food: 'ðŸ› Prasadam & Food',
            int_heritage: 'ðŸ›ï¸ Heritage & Monuments',
            int_market: 'ðŸ›ï¸ Bazaar & Shopping',
            int_nature: 'ðŸŒ¿ Nature & Parikrama',
            int_aarti: 'ðŸª” Aarti & Kirtan',
            int_festival: 'ðŸŽ‰ Festivals & Events',
            q5_title: 'ðŸš¶ Pace & Group',
            q5_pace: 'Your preferred pace:',
            pace_relaxed: 'ðŸ§˜ Relaxed',
            pace_relaxed_desc: 'Fewer places, more time at each',
            pace_moderate: 'âš–ï¸ Moderate',
            pace_moderate_desc: 'Balanced pace',
            pace_intensive: 'ðŸƒ Intensive',
            pace_intensive_desc: 'Cover maximum places',
            q5_group: 'Travelling as:',
            grp_solo: 'ðŸ§‘ Solo',
            grp_couple: 'ðŸ’‘ Couple',
            grp_family: 'ðŸ‘¨â€ðŸ‘©â€ðŸ‘§ Family',
            grp_group: 'ðŸ‘¥ Group',
            btn_back: 'â† Back',
            btn_next: 'Next â†’',
            btn_submit: 'ðŸ™ Plan My Yatra',
            error_msg: "I'm having trouble connecting. Please try again. ðŸ™",
            edit_itinerary: 'âœï¸ Edit',
            done_editing: 'âœ… Done',
            add_place: '+ Add Place',
            view_day_route: 'ðŸ“ View Day Route on Maps',
            view_full_route: 'ðŸ“ View Full Route on Google Maps â†’',
            view_city_route: 'ðŸ“ View {city} Route on Maps',
            online_status: 'Online',
            server_offline: 'Server Offline',
            llm_offline: 'LLM Offline',
            back_home: 'Back to Home',
            q3b_title: 'ðŸ“ Select Places',
            q3b_desc: 'Pick the specific places you want to visit',
            q6_title: 'ðŸ“ Starting Point & Time',
            q6_desc: 'Where are you starting from and when do you arrive?',
            q6_from_label: 'Starting from (city, station, or airport):',
            q6_from_placeholder: 'e.g. Delhi, Agra Cantt Station, Mathura Junction',
            q6_first_city: 'Which city do you want to visit first?',
            q6_time_label: 'Arrival / Start time:',
            time_morning: 'ðŸŒ… Early Morning (5-7 AM)',
            time_forenoon: 'â˜€ï¸ Forenoon (8-10 AM)',
            time_afternoon: 'ðŸŒ¤ï¸ Afternoon (12-2 PM)',
            time_evening: 'ðŸŒ‡ Evening (4-6 PM)',
            query_darshan: 'Recommend the best temples for darshan in Vrindavan',
            query_weather: "What's the weather like in Mathura today?",
            query_krishna: "Tell me about the significance of Braj Dham and Lord Krishna's leelas",
            query_prasadam: 'Recommend must-try prasadam and local food in Mathura and Vrindavan',
            query_parikrama: 'Plan a complete Braj 84 Kos Parikrama covering all sacred places',
            query_plan: 'Plan Your Yatra',
            query_festivals: 'Tell me about upcoming festivals and events in Braj Dham',
            query_darshan_city: 'Recommend the best temples for darshan in {city}',
            query_prasadam_city: 'Recommend must-try prasadam and local food in {city}',
            query_weather_city: "What's the weather like in {city} today?",
            city_picker_darshan: 'Select city for Temple Darshan Guide',
            city_picker_prasadam: 'Select city for Prasadam & Food',
            city_picker_weather: 'Select city for Weather'
        },
        hi: {
            logo_sub: 'à¤¹à¤°à¥‡ à¤•à¥ƒà¤·à¥à¤£ Â· AI à¤¤à¥€à¤°à¥à¤¥ à¤¸à¤¾à¤¥à¥€',
            new_chat: 'à¤¨à¤ˆ à¤µà¤¾à¤°à¥à¤¤à¤¾',
            quick_actions: 'ðŸª· à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤µà¤¿à¤•à¤²à¥à¤ª',
            plan_yatra: 'à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤¯à¥‹à¤œà¤¨à¤¾ (à¤ªà¥à¤°à¤¶à¥à¤¨à¤¾à¤µà¤²à¥€)',
            darshan_guide: 'à¤®à¤‚à¤¦à¤¿à¤° à¤¦à¤°à¥à¤¶à¤¨ à¤—à¤¾à¤‡à¤¡',
            weather: 'à¤®à¥Œà¤¸à¤®',
            krishna_leela: 'à¤•à¥ƒà¤·à¥à¤£ à¤²à¥€à¤²à¤¾ à¤à¤µà¤‚ à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸',
            prasadam: 'à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤® à¤à¤µà¤‚ à¤­à¥‹à¤œà¤¨',
            parikrama: 'à¤¬à¥à¤°à¤œ à¤ªà¤°à¤¿à¤•à¥à¤°à¤®à¤¾',
            connecting: 'à¤•à¤¨à¥‡à¤•à¥à¤Ÿ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ...',
            welcome_title: 'BRAJYATRA.AI',
            welcome_tagline: 'à¤œà¤¹à¤¾à¤ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤ªà¤°à¤‚à¤ªà¤°à¤¾ à¤¸à¥‡ à¤®à¤¿à¤²à¤¤à¥€ à¤¹à¥ˆ',
            welcome_desc: 'à¤ªà¤µà¤¿à¤¤à¥à¤° à¤¬à¥à¤°à¤œ à¤§à¤¾à¤® à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤ªà¤•à¤¾ AI à¤¤à¥€à¤°à¥à¤¥ à¤¸à¤¾à¤¥à¥€ â€” à¤‰à¤¸ à¤­à¥‚à¤®à¤¿ à¤ªà¤° à¤šà¤²à¥‡à¤‚ à¤œà¤¹à¤¾à¤ à¤¶à¥à¤°à¥€ à¤•à¥ƒà¤·à¥à¤£ à¤¨à¥‡ à¤…à¤ªà¤¨à¥€ à¤¦à¤¿à¤µà¥à¤¯ à¤²à¥€à¤²à¤¾à¤à¤ à¤•à¥€à¤‚à¥¤',
            card_plan: 'à¤…à¤ªà¤¨à¥€ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚',
            card_plan_desc: 'à¤…à¤ªà¤¨à¥€ à¤ªà¤¸à¤‚à¤¦ à¤•à¥‡ à¤…à¤¨à¥à¤¸à¤¾à¤° à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¤¾à¤°à¥à¤¯à¤•à¥à¤°à¤®',
            card_darshan: 'à¤®à¤‚à¤¦à¤¿à¤° à¤¦à¤°à¥à¤¶à¤¨',
            card_darshan_desc: 'à¤ªà¤µà¤¿à¤¤à¥à¤° à¤®à¤‚à¤¦à¤¿à¤° à¤à¤µà¤‚ à¤¦à¤¿à¤µà¥à¤¯ à¤¦à¤°à¥à¤¶à¤¨',
            card_festivals: 'à¤‰à¤¤à¥à¤¸à¤µ à¤à¤µà¤‚ à¤ªà¤°à¥à¤µ',
            card_festivals_desc: 'à¤ªà¤µà¤¿à¤¤à¥à¤° à¤¤à¥à¤¯à¥Œà¤¹à¤¾à¤° à¤à¤µà¤‚ à¤‰à¤¤à¥à¤¸à¤µ',
            card_parikrama: 'à¤ªà¤°à¤¿à¤•à¥à¤°à¤®à¤¾ à¤—à¤¾à¤‡à¤¡',
            card_parikrama_desc: 'à¤ªà¤µà¤¿à¤¤à¥à¤° à¤ªà¤°à¤¿à¤•à¥à¤°à¤®à¤¾ à¤®à¤¾à¤°à¥à¤—',
            input_placeholder: 'à¤¬à¥à¤°à¤œ à¤§à¤¾à¤® à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤ªà¥‚à¤›à¥‡à¤‚, à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚...',
            input_hint: 'à¤¬à¥à¤°à¤œà¤¯à¤¾à¤¤à¥à¤°à¤¾ Â· à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤¯à¥‹à¤œà¤¨à¤¾ Â· à¤¦à¤°à¥à¤¶à¤¨ à¤—à¤¾à¤‡à¤¡ Â· à¤®à¥Œà¤¸à¤® Â· à¤•à¥ƒà¤·à¥à¤£ à¤²à¥€à¤²à¤¾',
            modal_title: 'à¤…à¤ªà¤¨à¥€ à¤ªà¤µà¤¿à¤¤à¥à¤° à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚',
            modal_desc: 'à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¤¾à¤°à¥à¤¯à¤•à¥à¤°à¤® à¤•à¥‡ à¤²à¤¿à¤ à¤…à¤ªà¤¨à¥€ à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤•à¤¤à¤¾à¤à¤ à¤¬à¤¤à¤¾à¤à¤‚',
            q1_title: 'ðŸ™ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤ªà¥à¤°à¤•à¤¾à¤°',
            q1_desc: 'à¤†à¤ªà¤•à¥€ à¤†à¤¤à¥à¤®à¤¾ à¤•à¤¿à¤¸ à¤ªà¥à¤°à¤•à¤¾à¤° à¤•à¥€ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤šà¤¾à¤¹à¤¤à¥€ à¤¹à¥ˆ?',
            q1_opt1: 'à¤¤à¥€à¤°à¥à¤¥ à¤¯à¤¾à¤¤à¥à¤°à¤¾',
            q1_opt1_desc: 'à¤ªà¤µà¤¿à¤¤à¥à¤° à¤¤à¥€à¤°à¥à¤¥à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤à¤µà¤‚ à¤®à¤‚à¤¦à¤¿à¤° à¤¦à¤°à¥à¤¶à¤¨',
            q1_opt2: 'à¤¸à¤¾à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤¿à¤• à¤¦à¤°à¥à¤¶à¤¨',
            q1_opt2_desc: 'à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤¿, à¤µà¤¿à¤°à¤¾à¤¸à¤¤ à¤à¤µà¤‚ à¤¸à¥à¤®à¤¾à¤°à¤•',
            q1_opt3: 'à¤ªà¥‚à¤°à¥à¤£ à¤¬à¥à¤°à¤œ à¤¯à¤¾à¤¤à¥à¤°à¤¾',
            q1_opt3_desc: 'à¤¸à¤‚à¤ªà¥‚à¤°à¥à¤£ à¤¦à¥Œà¤°à¤¾ â€” à¤®à¤‚à¤¦à¤¿à¤°, à¤µà¤¿à¤°à¤¾à¤¸à¤¤ à¤à¤µà¤‚ à¤ªà¥à¤°à¤•à¥ƒà¤¤à¤¿',
            q1_opt4: 'à¤•à¤¸à¥à¤Ÿà¤® à¤®à¤¿à¤•à¥à¤¸',
            q1_opt4_desc: 'à¤®à¥ˆà¤‚ à¤…à¤ªà¤¨à¥€ à¤°à¥à¤šà¤¿à¤¯à¤¾à¤ à¤šà¥à¤¨à¥‚à¤à¤—à¤¾',
            q2_title: 'ðŸ“… à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤…à¤µà¤§à¤¿',
            q2_desc: 'à¤†à¤ªà¤•à¥€ à¤ªà¤µà¤¿à¤¤à¥à¤° à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¤¿à¤¤à¤¨à¥‡ à¤¦à¤¿à¤¨à¥‹à¤‚ à¤•à¥€?',
            q3_title: 'ðŸ“ à¤ªà¤µà¤¿à¤¤à¥à¤° à¤—à¤‚à¤¤à¤µà¥à¤¯',
            q3_desc: 'à¤‰à¤¨ à¤ªà¤µà¤¿à¤¤à¥à¤° à¤¶à¤¹à¤°à¥‹à¤‚ à¤•à¤¾ à¤šà¤¯à¤¨ à¤•à¤°à¥‡à¤‚ à¤œà¤¿à¤¨à¤•à¥€ à¤†à¤ª à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚',
            q4_title: 'ðŸª· à¤†à¤ªà¤•à¥€ à¤°à¥à¤šà¤¿à¤¯à¤¾à¤',
            q4_desc: 'à¤†à¤ª à¤•à¤¿à¤¨ à¤…à¤¨à¥à¤­à¤µà¥‹à¤‚ à¤•à¥€ à¤¤à¤²à¤¾à¤¶ à¤®à¥‡à¤‚ à¤¹à¥ˆà¤‚? (à¤à¤• à¤¸à¥‡ à¤…à¤§à¤¿à¤• à¤šà¥à¤¨à¥‡à¤‚)',
            int_temple: 'ðŸ›• à¤®à¤‚à¤¦à¤¿à¤° à¤¦à¤°à¥à¤¶à¤¨',
            int_ghat: 'ðŸŒŠ à¤˜à¤¾à¤Ÿ à¤à¤µà¤‚ à¤¸à¥à¤¨à¤¾à¤¨',
            int_food: 'ðŸ› à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤® à¤à¤µà¤‚ à¤­à¥‹à¤œà¤¨',
            int_heritage: 'ðŸ›ï¸ à¤µà¤¿à¤°à¤¾à¤¸à¤¤ à¤à¤µà¤‚ à¤¸à¥à¤®à¤¾à¤°à¤•',
            int_market: 'ðŸ›ï¸ à¤¬à¤¾à¤œà¤¼à¤¾à¤° à¤à¤µà¤‚ à¤–à¤°à¥€à¤¦à¤¾à¤°à¥€',
            int_nature: 'ðŸŒ¿ à¤ªà¥à¤°à¤•à¥ƒà¤¤à¤¿ à¤à¤µà¤‚ à¤ªà¤°à¤¿à¤•à¥à¤°à¤®à¤¾',
            int_aarti: 'ðŸª” à¤†à¤°à¤¤à¥€ à¤à¤µà¤‚ à¤•à¥€à¤°à¥à¤¤à¤¨',
            int_festival: 'ðŸŽ‰ à¤‰à¤¤à¥à¤¸à¤µ à¤à¤µà¤‚ à¤¤à¥à¤¯à¥Œà¤¹à¤¾à¤°',
            q5_title: 'ðŸš¶ à¤—à¤¤à¤¿ à¤à¤µà¤‚ à¤¸à¤®à¥‚à¤¹',
            q5_pace: 'à¤†à¤ªà¤•à¥€ à¤ªà¤¸à¤‚à¤¦à¥€à¤¦à¤¾ à¤—à¤¤à¤¿:',
            pace_relaxed: 'ðŸ§˜ à¤¸à¤¹à¤œ',
            pace_relaxed_desc: 'à¤•à¤® à¤¸à¥à¤¥à¤¾à¤¨, à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤ªà¤° à¤…à¤§à¤¿à¤• à¤¸à¤®à¤¯',
            pace_moderate: 'âš–ï¸ à¤®à¤§à¥à¤¯à¤®',
            pace_moderate_desc: 'à¤¸à¤‚à¤¤à¥à¤²à¤¿à¤¤ à¤—à¤¤à¤¿',
            pace_intensive: 'ðŸƒ à¤‰à¤¤à¥à¤¸à¤¾à¤¹à¥€',
            pace_intensive_desc: 'à¤…à¤§à¤¿à¤•à¤¤à¤® à¤¸à¥à¤¥à¤¾à¤¨à¥‹à¤‚ à¤ªà¤° à¤œà¤¾à¤à¤‚',
            q5_group: 'à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¤¿à¤¸à¤•à¥‡ à¤¸à¤¾à¤¥:',
            grp_solo: 'ðŸ§‘ à¤…à¤•à¥‡à¤²à¥‡',
            grp_couple: 'ðŸ’‘ à¤œà¥‹à¤¡à¤¼à¤¾',
            grp_family: 'ðŸ‘¨â€ðŸ‘©â€ðŸ‘§ à¤ªà¤°à¤¿à¤µà¤¾à¤°',
            grp_group: 'ðŸ‘¥ à¤¸à¤®à¥‚à¤¹',
            btn_back: 'â† à¤ªà¥€à¤›à¥‡',
            btn_next: 'à¤†à¤—à¥‡ â†’',
            btn_submit: 'ðŸ™ à¤®à¥‡à¤°à¥€ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚',
            error_msg: 'à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚ ðŸ™ à¤•à¤¨à¥‡à¤•à¥à¤Ÿ à¤•à¤°à¤¨à¥‡ à¤®à¥‡à¤‚ à¤¸à¤®à¤¸à¥à¤¯à¤¾ à¤¹à¥‹ à¤°à¤¹à¥€ à¤¹à¥ˆà¥¤',
            edit_itinerary: 'âœï¸ à¤¸à¤‚à¤ªà¤¾à¤¦à¤¿à¤¤ à¤•à¤°à¥‡à¤‚',
            done_editing: 'âœ… à¤ªà¥‚à¤°à¥à¤£',
            add_place: '+ à¤¸à¥à¤¥à¤¾à¤¨ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚',
            view_day_route: 'ðŸ“ à¤¦à¤¿à¤¨ à¤•à¤¾ à¤®à¤¾à¤°à¥à¤— à¤®à¤¾à¤¨à¤šà¤¿à¤¤à¥à¤° à¤ªà¤° à¤¦à¥‡à¤–à¥‡à¤‚',
            view_full_route: 'ðŸ“ à¤ªà¥‚à¤°à¤¾ à¤®à¤¾à¤°à¥à¤— Google Maps à¤ªà¤° à¤¦à¥‡à¤–à¥‡à¤‚ â†’',
            view_city_route: 'ðŸ“ {city} à¤•à¤¾ à¤®à¤¾à¤°à¥à¤— à¤®à¤¾à¤¨à¤šà¤¿à¤¤à¥à¤° à¤ªà¤° à¤¦à¥‡à¤–à¥‡à¤‚',
            online_status: 'à¤‘à¤¨à¤²à¤¾à¤‡à¤¨',
            server_offline: 'à¤¸à¤°à¥à¤µà¤° à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨',
            llm_offline: 'LLM à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨',
            back_home: 'à¤µà¤¾à¤ªà¤¸ à¤¹à¥‹à¤® à¤ªà¤°',
            q3b_title: 'ðŸ“ à¤¸à¥à¤¥à¤¾à¤¨ à¤šà¥à¤¨à¥‡à¤‚',
            q3b_desc: 'à¤µà¥‡ à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤¸à¥à¤¥à¤¾à¤¨ à¤šà¥à¤¨à¥‡à¤‚ à¤œà¤¿à¤¨à¥à¤¹à¥‡à¤‚ à¤†à¤ª à¤¦à¥‡à¤–à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚',
            q6_title: 'ðŸ“ à¤ªà¥à¤°à¤¾à¤°à¤‚à¤­ à¤¸à¥à¤¥à¤¾à¤¨ à¤à¤µà¤‚ à¤¸à¤®à¤¯',
            q6_desc: 'à¤†à¤ª à¤•à¤¹à¤¾à¤ à¤¸à¥‡ à¤† à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚ à¤”à¤° à¤•à¤¬ à¤ªà¤¹à¥à¤à¤šà¥‡à¤‚à¤—à¥‡?',
            q6_from_label: 'à¤ªà¥à¤°à¤¾à¤°à¤‚à¤­ à¤¸à¥à¤¥à¤¾à¤¨ (à¤¶à¤¹à¤°, à¤¸à¥à¤Ÿà¥‡à¤¶à¤¨, à¤¯à¤¾ à¤¹à¤µà¤¾à¤ˆ à¤…à¤¡à¥à¤¡à¤¾):',
            q6_from_placeholder: 'à¤œà¥ˆà¤¸à¥‡ à¤¦à¤¿à¤²à¥à¤²à¥€, à¤†à¤—à¤°à¤¾ à¤•à¥ˆà¤‚à¤Ÿ à¤¸à¥à¤Ÿà¥‡à¤¶à¤¨, à¤®à¤¥à¥à¤°à¤¾ à¤œà¤‚à¤•à¥à¤¶à¤¨',
            q6_first_city: 'à¤ªà¤¹à¤²à¥‡ à¤•à¥Œà¤¨ à¤¸à¤¾ à¤¶à¤¹à¤° à¤¦à¥‡à¤–à¤¨à¤¾ à¤šà¤¾à¤¹à¥‡à¤‚à¤—à¥‡?',
            q6_time_label: 'à¤†à¤—à¤®à¤¨ / à¤ªà¥à¤°à¤¾à¤°à¤‚à¤­ à¤¸à¤®à¤¯:',
            time_morning: 'ðŸŒ… à¤¸à¥à¤¬à¤¹ à¤œà¤²à¥à¤¦à¥€ (5-7 AM)',
            time_forenoon: 'â˜€ï¸ à¤¸à¥à¤¬à¤¹ (8-10 AM)',
            time_afternoon: 'ðŸŒ¤ï¸ à¤¦à¥‹à¤ªà¤¹à¤° (12-2 PM)',
            time_evening: 'ðŸŒ‡ à¤¶à¤¾à¤® (4-6 PM)',
            query_darshan: 'à¤µà¥ƒà¤¨à¥à¤¦à¤¾à¤µà¤¨ à¤®à¥‡à¤‚ à¤¦à¤°à¥à¤¶à¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤°à¥à¤µà¤¶à¥à¤°à¥‡à¤·à¥à¤  à¤®à¤‚à¤¦à¤¿à¤°à¥‹à¤‚ à¤•à¥€ à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶ à¤•à¤°à¥‡à¤‚',
            query_weather: 'à¤†à¤œ à¤®à¤¥à¥à¤°à¤¾ à¤®à¥‡à¤‚ à¤®à¥Œà¤¸à¤® à¤•à¥ˆà¤¸à¤¾ à¤¹à¥ˆ?',
            query_krishna: 'à¤¬à¥à¤°à¤œ à¤§à¤¾à¤® à¤”à¤° à¤­à¤—à¤µà¤¾à¤¨ à¤¶à¥à¤°à¥€ à¤•à¥ƒà¤·à¥à¤£ à¤•à¥€ à¤²à¥€à¤²à¤¾à¤“à¤‚ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤¬à¤¤à¤¾à¤à¤‚',
            query_prasadam: 'à¤®à¤¥à¥à¤°à¤¾ à¤”à¤° à¤µà¥ƒà¤¨à¥à¤¦à¤¾à¤µà¤¨ à¤®à¥‡à¤‚ à¤œà¤°à¥‚à¤° à¤–à¤¾à¤¨à¥‡ à¤µà¤¾à¤²à¥‡ à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤® à¤”à¤° à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤­à¥‹à¤œà¤¨ à¤•à¥€ à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶ à¤•à¤°à¥‡à¤‚',
            query_parikrama: 'à¤¸à¤­à¥€ à¤ªà¤µà¤¿à¤¤à¥à¤° à¤¸à¥à¤¥à¤²à¥‹à¤‚ à¤•à¥‹ à¤•à¤µà¤° à¤•à¤°à¤¤à¥‡ à¤¹à¥à¤ à¤ªà¥‚à¤°à¥à¤£ à¤¬à¥à¤°à¤œ 84 à¤•à¥‹à¤¸ à¤ªà¤°à¤¿à¤•à¥à¤°à¤®à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚',
            query_plan: 'à¤…à¤ªà¤¨à¥€ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚',
            query_festivals: 'à¤¬à¥à¤°à¤œ à¤§à¤¾à¤® à¤®à¥‡à¤‚ à¤†à¤¨à¥‡ à¤µà¤¾à¤²à¥‡ à¤¤à¥à¤¯à¥Œà¤¹à¤¾à¤°à¥‹à¤‚ à¤”à¤° à¤‰à¤¤à¥à¤¸à¤µà¥‹à¤‚ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤¬à¤¤à¤¾à¤à¤‚',
            query_darshan_city: '{city} à¤®à¥‡à¤‚ à¤¦à¤°à¥à¤¶à¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤°à¥à¤µà¤¶à¥à¤°à¥‡à¤·à¥à¤  à¤®à¤‚à¤¦à¤¿à¤°à¥‹à¤‚ à¤•à¥€ à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶ à¤•à¤°à¥‡à¤‚',
            query_prasadam_city: '{city} à¤®à¥‡à¤‚ à¤œà¤°à¥‚à¤° à¤–à¤¾à¤¨à¥‡ à¤µà¤¾à¤²à¥‡ à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤® à¤”à¤° à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤­à¥‹à¤œà¤¨ à¤•à¥€ à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶ à¤•à¤°à¥‡à¤‚',
            query_weather_city: 'à¤†à¤œ {city} à¤®à¥‡à¤‚ à¤®à¥Œà¤¸à¤® à¤•à¥ˆà¤¸à¤¾ à¤¹à¥ˆ?',
            city_picker_darshan: 'à¤®à¤‚à¤¦à¤¿à¤° à¤¦à¤°à¥à¤¶à¤¨ à¤—à¤¾à¤‡à¤¡ à¤•à¥‡ à¤²à¤¿à¤ à¤¶à¤¹à¤° à¤šà¥à¤¨à¥‡à¤‚',
            city_picker_prasadam: 'à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤® à¤à¤µà¤‚ à¤­à¥‹à¤œà¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤¶à¤¹à¤° à¤šà¥à¤¨à¥‡à¤‚',
            city_picker_weather: 'à¤®à¥Œà¤¸à¤® à¤•à¥‡ à¤²à¤¿à¤ à¤¶à¤¹à¤° à¤šà¥à¤¨à¥‡à¤‚'
        }
    };

    let sessionId = localStorage.getItem('brajyatra_session') || null;
    let currentLanguage = localStorage.getItem('brajyatra_lang') || 'en';
    let isLoading = false;
    let currentStep = 1;
    const totalSteps = 6;
    let currentItinerary = null;
    let editMode = false;
    let currentAbortController = null;
    let pendingCityPickerQueryKey = null;
    let pendingWeatherPrefData = null;

    // â”€â”€ Auth Token (read from URL param passed by main app iframe) â”€â”€
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token') || null;

    function getAuthHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        return headers;
    }

    const prefs = {
        yatraType: '',
        days: 3,
        cities: [],
        interests: [],
        selectedPlaces: [],
        pace: 'moderate',
        group: 'family',
        startLocation: '',
        firstCity: '',
        startTime: 'forenoon'
    };

    const CITY_IMAGES = {
        'Mathura': `${STATIC_BASE}/assets/images/krishna_janmabhoomi.png`,
        'Vrindavan': `${STATIC_BASE}/assets/images/banke_bihari.png`,
        'Agra': `${STATIC_BASE}/assets/images/taj_mahal.png`,
        'Govardhan': `${STATIC_BASE}/assets/images/govardhan_hill.png`,
        'Barsana': `${STATIC_BASE}/assets/images/radha_rani_temple.png`,
        'Gokul': `${STATIC_BASE}/assets/images/nand_bhavan.png`
    };

    const PLACE_IMAGES = {
        'krishna_janmabhoomi': `${STATIC_BASE}/assets/images/krishna_janmabhoomi.png`,
        'janmabhoomi': `${STATIC_BASE}/assets/images/krishna_janmabhoomi.png`,
        'janmasthan': `${STATIC_BASE}/assets/images/krishna_janmabhoomi.png`,
        'dwarkadhish': `${STATIC_BASE}/assets/images/krishna_janmabhoomi.png`,
        'banke bihari': `${STATIC_BASE}/assets/images/banke_bihari.png`,
        'prem mandir': `${STATIC_BASE}/assets/images/prem_mandir.png`,
        'iskcon': `${STATIC_BASE}/assets/images/prem_mandir.png`,
        'taj mahal': `${STATIC_BASE}/assets/images/taj_mahal.png`,
        'agra fort': `${STATIC_BASE}/assets/images/taj_mahal.png`,
        'govardhan': `${STATIC_BASE}/assets/images/govardhan_hill.png`,
        'parikrama': `${STATIC_BASE}/assets/images/govardhan_hill.png`,
        'manasi ganga': `${STATIC_BASE}/assets/images/govardhan_hill.png`,
        'radha rani': `${STATIC_BASE}/assets/images/radha_rani_temple.png`,
        'barsana': `${STATIC_BASE}/assets/images/radha_rani_temple.png`,
        'nand bhavan': `${STATIC_BASE}/assets/images/nand_bhavan.png`,
        'raman reti': `${STATIC_BASE}/assets/images/nand_bhavan.png`,
        'gokul': `${STATIC_BASE}/assets/images/nand_bhavan.png`,
        'vishram ghat': `${STATIC_BASE}/assets/images/vishram_ghat.png`,
        'yamuna': `${STATIC_BASE}/assets/images/vishram_ghat.png`,
    };

    const CATEGORY_IMAGES = {
        'temple': `${STATIC_BASE}/assets/images/krishna_janmabhoomi.png`,
        'ghat': `${STATIC_BASE}/assets/images/vishram_ghat.png`,
        'monument': `${STATIC_BASE}/assets/images/taj_mahal.png`,
        'market': `${STATIC_BASE}/assets/images/banke_bihari.png`,
        'nature': `${STATIC_BASE}/assets/images/govardhan_hill.png`,
        'heritage': `${STATIC_BASE}/assets/images/taj_mahal.png`,
        'religious': `${STATIC_BASE}/assets/images/prem_mandir.png`,
    };

    // Detect if running inside the unified server (served at /agent/*)
    const IS_UNIFIED = window.location.pathname.startsWith('/agent');
    const API_BASE = IS_UNIFIED ? '/api/agent' : '/api';
    const USER_API_BASE = '/api/user';
    const STATIC_BASE = IS_UNIFIED ? '/agent' : '';

    const CLIENT_ORIGIN = (window.location.port === '3000' || window.location.port === '5000')
        ? 'http://localhost:5173'
        : window.location.origin;

    const VIRTUAL_TOURS = {
        'mariam': '/virtual-tours/mariam-tomb',
        'mariam-uz-zamani': '/virtual-tours/mariam-tomb',
        'sikandra': '/virtual-tours/sikandra',
        'akbar tomb': '/virtual-tours/sikandra',
        'akbar\'s tomb': '/virtual-tours/sikandra',
        'akbar': '/virtual-tours/sikandra',
        'tomb of akbar': '/virtual-tours/sikandra',
        'itmad': '/virtual-tours/itmad',
        'itmad-ud-daulah': '/virtual-tours/itmad',
        'baby taj': '/virtual-tours/itmad',
        'aram bagh': '/virtual-tours/aram',
        'ram bagh': '/virtual-tours/aram',
        'chini ka rauza': '/virtual-tours/chini-ka-rauza',
        'chini-ka-rauza': '/virtual-tours/chini-ka-rauza',
    };

    const messagesContainer = document.getElementById('messages-container');
    const welcomeScreen = document.getElementById('welcome-screen');
    const messageInput = document.getElementById('message-input');
    const btnSend = document.getElementById('btn-send');
    const btnStop = document.getElementById('btn-stop');
    const btnNewChat = document.getElementById('btn-new-chat');
    const btnMenu = document.getElementById('btn-menu');
    const sidebar = document.getElementById('sidebar');
    const llmStatus = document.getElementById('llm-status');

    const modal = document.getElementById('questionnaire-modal');
    const modalClose = document.getElementById('modal-close');
    const btnBack = document.getElementById('q-back');
    const btnNext = document.getElementById('q-next');
    const btnSubmit = document.getElementById('q-submit');

    function t(key) {
        return (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) || TRANSLATIONS.en[key] || key;
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('brajyatra_lang', lang);

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });

        const descEl = document.querySelector('[data-i18n="welcome_desc"]');
        if (descEl) {
            if (lang === 'en') {
                descEl.innerHTML = 'Your AI-powered <em>Tirth Companion</em> for the sacred <strong>Braj Dham</strong> â€” walk the land where <strong>Shri Krishna</strong> performed His divine leelas.';
            } else {
                descEl.innerHTML = 'à¤ªà¤µà¤¿à¤¤à¥à¤° <strong>à¤¬à¥à¤°à¤œ à¤§à¤¾à¤®</strong> à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤ªà¤•à¤¾ AI <em>à¤¤à¥€à¤°à¥à¤¥ à¤¸à¤¾à¤¥à¥€</em> â€” à¤‰à¤¸ à¤­à¥‚à¤®à¤¿ à¤ªà¤° à¤šà¤²à¥‡à¤‚ à¤œà¤¹à¤¾à¤ <strong>à¤¶à¥à¤°à¥€ à¤•à¥ƒà¤·à¥à¤£</strong> à¤¨à¥‡ à¤…à¤ªà¤¨à¥€ à¤¦à¤¿à¤µà¥à¤¯ à¤²à¥€à¤²à¤¾à¤à¤ à¤•à¥€à¤‚à¥¤';
            }
        }
    }

    function initTheme() {
        const saved = localStorage.getItem('brajyatra_theme') || 'light';
        applyTheme(saved);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('brajyatra_theme', theme);

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#0d1421' : '#fef9ef';

        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            const icon = btn.querySelector('.theme-icon');
            const label = btn.querySelector('.theme-label');
            if (icon) icon.textContent = theme === 'dark' ? 'â˜€ï¸' : 'ðŸŒ™';
            if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    function init() {
        initTheme();
        bindEvents();
        setLanguage(currentLanguage);
        checkHealth();
        loadCities();
        autoResizeTextarea();
        if (sessionId) {
            loadChatHistory(sessionId);
        }
    }

    function bindEvents() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                localStorage.setItem('brajyatra_sidebar', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
            });
            if (localStorage.getItem('brajyatra_sidebar') === 'collapsed') {
                sidebar.classList.add('collapsed');
            }
        }

        btnSend.addEventListener('click', handleSend);
        if (btnStop) btnStop.addEventListener('click', stopChat);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
        });
        messageInput.addEventListener('input', () => {
            btnSend.disabled = messageInput.value.trim().length === 0;
            autoResizeTextarea();
        });

        messagesContainer.addEventListener('click', (e) => {
            const searchBadge = e.target.closest('.search-badge, .rec-search-btn');
            if (searchBadge) {
                e.preventDefault();
                e.stopPropagation();
                const place = searchBadge.dataset.place;
                const city = searchBadge.dataset.city;
                if (place) searchPlace(place, city);
            }
        });

        btnNewChat.addEventListener('click', startNewChat);

        const btnBackLanding = document.getElementById('btn-back-landing');
        if (btnBackLanding) {
            btnBackLanding.addEventListener('click', () => {
                if (typeof window.goToLanding === 'function') window.goToLanding();
            });
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
        });

        document.querySelectorAll('.quick-btn, .welcome-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const queryKey = btn.dataset.queryKey;
                if (action === 'questionnaire') {
                    openQuestionnaire();
                } else if (queryKey && ['query_darshan', 'query_prasadam', 'query_weather'].includes(queryKey)) {
                    openCityPicker(queryKey);
                } else if (queryKey) {
                    messageInput.value = t(queryKey);
                    handleSend();
                } else if (action) {
                    messageInput.value = action;
                    handleSend();
                }
            });
        });

        if (btnMenu) btnMenu.addEventListener('click', toggleSidebar);

        modalClose.addEventListener('click', closeQuestionnaire);
        btnBack.addEventListener('click', prevStep);
        btnNext.addEventListener('click', nextStep);
        btnSubmit.addEventListener('click', submitQuestionnaire);

        bindQuestionnaireEvents();
    }

    function autoResizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }

    async function loadCities() {
        try {
            const res = await fetch(`${API_BASE}/cities`);
            const cities = await res.json();
            renderWelcomeCities(cities);
            renderQuestionnaireCities(cities);
        } catch (e) {
            const fallback = Object.keys(CITY_IMAGES).map(name => ({
                name, image: CITY_IMAGES[name], count: 20
            }));
            renderWelcomeCities(fallback);
            renderQuestionnaireCities(fallback);
        }
    }

    async function loadChatHistory(sid) {
        try {
            const res = await fetch(`${API_BASE}/session/${sid}/history`);
            if (!res.ok) return;
            const history = await res.json();
            if (!history || history.length === 0) return;

            if (welcomeScreen) welcomeScreen.style.display = 'none';

            for (const msg of history) {
                if (msg.role === 'user') {
                    appendMessage('user', msg.content);
                } else if (msg.role === 'assistant') {
                    let parsed = null;
                    try { parsed = JSON.parse(msg.content); } catch (e) { }

                    if (parsed && parsed.days && Array.isArray(parsed.days)) {
                        renderItinerary(parsed);
                    } else if (parsed && parsed.recommendations) {
                        renderRecommendations(parsed.recommendations, parsed.summary);
                    } else {
                        appendMessage('assistant', msg.content);
                    }
                }
            }
            scrollToBottom();
        } catch (e) {
            console.warn('[BrajYatra] Failed to load chat history:', e.message);
        }
    }

    function renderWelcomeCities(cities) {
        const container = document.getElementById('welcome-cities');
        if (!container) return;
        container.innerHTML = cities.map(c => `
            <div class="city-card">
                <img src="${c.image}" alt="${c.name}" loading="lazy">
                <div class="city-name">${c.name}</div>
            </div>
        `).join('');
    }

    function renderQuestionnaireCities(cities) {
        const container = document.getElementById('q-cities');
        if (!container) return;
        container.innerHTML = cities.map(c => `
            <div class="q-city" data-value="${c.name}">
                <img src="${c.image}" alt="${c.name}" loading="lazy">
                <div class="q-city-label">${c.name}<span class="q-city-count">${c.count} places</span></div>
            </div>
        `).join('');

        container.querySelectorAll('.q-city').forEach(el => {
            el.addEventListener('click', () => {
                el.classList.toggle('selected');
                updatePrefs();
            });
        });
    }

    async function checkHealth() {
        try {
            const res = await fetch(`${API_BASE}/health`);
            const data = await res.json();
            const dot = llmStatus.querySelector('.status-dot');
            const text = llmStatus.querySelector('.status-text');
            if (data.llm && data.llm.available) {
                dot.className = 'status-dot online';
                text.textContent = `${t('online_status')} Â· ${data.places} tirth sthals`;
            } else {
                dot.className = 'status-dot offline';
                text.textContent = t('llm_offline');
            }
        } catch {
            const dot = llmStatus.querySelector('.status-dot');
            const text = llmStatus.querySelector('.status-text');
            dot.className = 'status-dot offline';
            text.textContent = t('server_offline');
        }
    }

    function openQuestionnaire() {
        currentStep = 1;
        resetQuestionnaire();
        modal.classList.add('active');
        showStep(1);
        closeSidebar();
    }

    function closeQuestionnaire() { modal.classList.remove('active'); }

    function resetQuestionnaire() {
        prefs.yatraType = '';
        prefs.days = 3;
        prefs.cities = [];
        prefs.interests = [];
        prefs.selectedPlaces = [];
        prefs.pace = 'moderate';
        prefs.group = 'family';
        prefs.startLocation = '';
        prefs.firstCity = '';
        prefs.startTime = 'forenoon';
        document.querySelectorAll('.q-option.selected, .q-city.selected, .q-chip.selected, .q-chip-sm.selected').forEach(el => el.classList.remove('selected'));
        const placePicker = document.getElementById('q-place-picker');
        if (placePicker) placePicker.innerHTML = '';
        document.querySelectorAll('.q-day-btn').forEach(el => el.classList.toggle('active', el.dataset.value === '3'));
        document.querySelectorAll('.q-option-sm').forEach(el => {
            el.classList.remove('active', 'selected');
            if (el.dataset.value === 'moderate') el.classList.add('active');
        });
        document.querySelectorAll('.q-time-options .q-chip-sm').forEach(el => {
            el.classList.remove('active', 'selected');
            if (el.dataset.value === 'forenoon') el.classList.add('active');
        });
        const startInput = document.getElementById('q-start-location');
        if (startInput) startInput.value = '';
    }

    function showStep(step) {
        currentStep = step;
        const step3b = document.getElementById('q-step-3b');
        if (step3b) step3b.classList.add('hidden');

        for (let i = 1; i <= totalSteps; i++) {
            const el = document.getElementById(`q-step-${i}`);
            if (el) el.classList.toggle('hidden', i !== step);
        }

        if (step === '3b') {
            for (let i = 1; i <= totalSteps; i++) {
                const el = document.getElementById(`q-step-${i}`);
                if (el) el.classList.add('hidden');
            }
            if (step3b) step3b.classList.remove('hidden');
        }

        document.querySelectorAll('.step-dot').forEach(dot => {
            const s = parseInt(dot.dataset.step);
            dot.classList.remove('active', 'done');
            const numStep = step === '3b' ? 3.5 : step;
            if (s === Math.ceil(numStep)) dot.classList.add('active');
            else if (s < numStep) dot.classList.add('done');
        });

        btnBack.classList.toggle('hidden', step === 1);
        btnNext.classList.toggle('hidden', step === totalSteps);
        btnSubmit.classList.toggle('hidden', step !== totalSteps);

        if (step === 6) {
            populateFirstCityOptions();
        }
        if (step === '3b') {
            populatePlacePicker();
        }
    }

    function nextStep() {
        if (currentStep === 3 && prefs.yatraType === 'mixed') {
            showStep('3b');
            return;
        }
        if (currentStep === '3b') {
            showStep(5);
            return;
        }
        if (currentStep === 3 && prefs.yatraType !== 'mixed') {
            showStep(4);
            return;
        }
        if (currentStep < totalSteps) showStep(currentStep + 1);
    }

    function prevStep() {
        if (currentStep === '3b') {
            showStep(3);
            return;
        }
        if (currentStep === 5 && prefs.yatraType === 'mixed') {
            showStep('3b');
            return;
        }
        if (currentStep > 1) showStep(currentStep - 1);
    }

    function bindQuestionnaireEvents() {
        document.querySelectorAll('#q-step-1 .q-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#q-step-1 .q-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                prefs.yatraType = btn.dataset.value;
            });
        });
        document.querySelectorAll('.q-day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.q-day-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                prefs.days = parseInt(btn.dataset.value);
            });
        });
        document.querySelectorAll('#q-step-4 .q-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
                updatePrefs();
            });
        });
        document.querySelectorAll('.q-pace .q-option-sm').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.q-pace .q-option-sm').forEach(b => b.classList.remove('active', 'selected'));
                btn.classList.add('active');
                prefs.pace = btn.dataset.value;
            });
        });
        document.querySelectorAll('.q-group .q-chip-sm').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.q-group .q-chip-sm').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                prefs.group = btn.dataset.value;
            });
        });

        document.querySelectorAll('.q-time-options .q-chip-sm').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.q-time-options .q-chip-sm').forEach(b => b.classList.remove('active', 'selected'));
                btn.classList.add('active');
                prefs.startTime = btn.dataset.value;
            });
        });
    }

    function populateFirstCityOptions() {
        const container = document.getElementById('q-first-city');
        if (!container) return;
        const selectedCities = prefs.cities.length > 0 ? prefs.cities : Object.keys(CITY_IMAGES);
        container.innerHTML = selectedCities.map(city => `
            <button class="q-chip-sm${prefs.firstCity === city ? ' selected' : ''}" data-value="${city}">${city}</button>
        `).join('');
        container.querySelectorAll('.q-chip-sm').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.q-chip-sm').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                prefs.firstCity = btn.dataset.value;
            });
        });
    }

    function updatePrefs() {
        prefs.cities = Array.from(document.querySelectorAll('.q-city.selected')).map(el => el.dataset.value);
        prefs.interests = Array.from(document.querySelectorAll('#q-step-4 .q-chip.selected')).map(el => el.dataset.value);
        prefs.selectedPlaces = Array.from(document.querySelectorAll('#q-place-picker .q-place-item.selected')).map(el => el.dataset.placeName);
    }

    async function populatePlacePicker() {
        const container = document.getElementById('q-place-picker');
        if (!container) return;

        const selectedCities = prefs.cities.length > 0 ? prefs.cities : Object.keys(CITY_IMAGES);
        container.innerHTML = '<div class="city-places-loading">Loading places...</div>';

        let html = '';
        for (const city of selectedCities) {
            try {
                const res = await fetch(`${API_BASE}/places?city=${encodeURIComponent(city)}`);
                const places = await res.json();
                if (!places || places.length === 0) continue;

                html += `<div class="q-place-city-group">`;
                html += `<h4 class="q-place-city-title">ðŸ“ ${city}</h4>`;
                html += `<div class="q-place-list">`;
                for (const p of places) {
                    const isSelected = prefs.selectedPlaces.includes(p.name) ? ' selected' : '';
                    html += `<div class="q-place-item${isSelected}" data-place-name="${p.name}" data-city="${city}">`;
                    html += `<span class="q-place-check">${isSelected ? 'âœ“' : ''}</span>`;
                    html += `<span class="q-place-name">${p.name}</span>`;
                    html += `<span class="q-place-cat-badge">${p.category || ''}</span>`;
                    html += `</div>`;
                }
                html += `</div></div>`;
            } catch (e) {
                console.warn(`Failed to load places for ${city}:`, e);
            }
        }

        container.innerHTML = html || '<p>No places found.</p>';

        container.querySelectorAll('.q-place-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
                const check = item.querySelector('.q-place-check');
                if (check) check.textContent = item.classList.contains('selected') ? 'âœ“' : '';
                updatePrefs();
            });
        });
    }

    function submitQuestionnaire() {
        updatePrefs();

        const startInput = document.getElementById('q-start-location');
        if (startInput) prefs.startLocation = startInput.value.trim();

        closeQuestionnaire();

        const yatraNames = {
            'pilgrimage': 'Tirth Yatra (pilgrimage focused)',
            'cultural': 'Cultural Heritage Tour',
            'complete': 'Complete Braj Yatra (full tour)',
            'mixed': 'custom mix'
        };
        const paceNames = {
            'relaxed': 'relaxed',
            'moderate': 'moderate',
            'intensive': 'intensive (cover maximum)'
        };
        const timeNames = {
            'morning': 'early morning (5-7 AM)',
            'forenoon': 'forenoon (8-10 AM)',
            'afternoon': 'afternoon (12-2 PM)',
            'evening': 'evening (4-6 PM)'
        };
        const cities = prefs.cities.length > 0 ? prefs.cities.join(', ') : 'Mathura, Vrindavan';
        const isCustomMix = prefs.yatraType === 'mixed';
        const interests = prefs.interests.length > 0 ? prefs.interests.join(', ') : 'temples, heritage, food';
        const selectedPlacesStr = prefs.selectedPlaces.length > 0 ? prefs.selectedPlaces.join(', ') : '';
        const yatraType = yatraNames[prefs.yatraType] || 'spiritual journey';

        let cityOrder = '';

        let startInfo = '';

        const startTimeStr = timeNames[prefs.startTime] || 'forenoon';

        let msg;
        if (currentLanguage === 'hi') {
            if (prefs.firstCity) cityOrder = ` à¤¯à¤¾à¤¤à¥à¤°à¤¾ ${prefs.firstCity} à¤¸à¥‡ à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚à¥¤`;
            if (prefs.startLocation) startInfo = ` à¤®à¥ˆà¤‚ ${prefs.startLocation} à¤¸à¥‡ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¤° à¤°à¤¹à¤¾/à¤°à¤¹à¥€ à¤¹à¥‚à¤à¥¤`;
            if (isCustomMix && selectedPlacesStr) {
                msg = `${cities} à¤•à¥‹ à¤•à¤µà¤° à¤•à¤°à¤¤à¥‡ à¤¹à¥à¤ ${prefs.days}-à¤¦à¤¿à¤¨ à¤•à¥€ ${yatraType} à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚à¥¤ à¤®à¥ˆà¤‚ à¤µà¤¿à¤¶à¥‡à¤· à¤°à¥‚à¤ª à¤¸à¥‡ à¤‡à¤¨ à¤¸à¥à¤¥à¤¾à¤¨à¥‹à¤‚ à¤ªà¤° à¤œà¤¾à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¤¾/à¤šà¤¾à¤¹à¤¤à¥€ à¤¹à¥‚à¤: ${selectedPlacesStr}à¥¤ à¤—à¤¤à¤¿: ${paceNames[prefs.pace] || 'à¤®à¤§à¥à¤¯à¤®'}à¥¤ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤¸à¤®à¥‚à¤¹: ${prefs.group || 'à¤ªà¤°à¤¿à¤µà¤¾à¤°'}à¥¤${startInfo}${cityOrder} à¤®à¥ˆà¤‚ ${startTimeStr} à¤®à¥‡à¤‚ à¤ªà¤¹à¥à¤à¤šà¥‚à¤à¤—à¤¾/à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‚à¤à¤—à¤¾à¥¤ à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤¶à¤¹à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤…à¤²à¤— Google Maps à¤®à¤¾à¤°à¥à¤— à¤¬à¤¨à¤¾à¤à¤‚à¥¤ à¤¦à¤°à¥à¤¶à¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤°à¥à¤µà¤¶à¥à¤°à¥‡à¤·à¥à¤  à¤®à¤‚à¤¦à¤¿à¤°, à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤® à¤•à¥€ à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶à¥‡à¤‚, à¤”à¤° à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤• à¤¸à¥à¤à¤¾à¤µ à¤¶à¤¾à¤®à¤¿à¤² à¤•à¤°à¥‡à¤‚à¥¤`;
            } else {
                msg = `${cities} à¤•à¥‹ à¤•à¤µà¤° à¤•à¤°à¤¤à¥‡ à¤¹à¥à¤ ${prefs.days}-à¤¦à¤¿à¤¨ à¤•à¥€ ${yatraType} à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤•à¥€ à¤¯à¥‹à¤œà¤¨à¤¾ à¤¬à¤¨à¤¾à¤à¤‚à¥¤ à¤®à¥‡à¤°à¥€ à¤°à¥à¤šà¤¿à¤¯à¤¾à¤: ${interests}à¥¤ à¤—à¤¤à¤¿: ${paceNames[prefs.pace] || 'à¤®à¤§à¥à¤¯à¤®'}à¥¤ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤¸à¤®à¥‚à¤¹: ${prefs.group || 'à¤ªà¤°à¤¿à¤µà¤¾à¤°'}à¥¤${startInfo}${cityOrder} à¤®à¥ˆà¤‚ ${startTimeStr} à¤®à¥‡à¤‚ à¤ªà¤¹à¥à¤à¤šà¥‚à¤à¤—à¤¾/à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‚à¤à¤—à¤¾à¥¤ à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤¶à¤¹à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤…à¤²à¤— Google Maps à¤®à¤¾à¤°à¥à¤— à¤¬à¤¨à¤¾à¤à¤‚à¥¤ à¤¦à¤°à¥à¤¶à¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤°à¥à¤µà¤¶à¥à¤°à¥‡à¤·à¥à¤  à¤®à¤‚à¤¦à¤¿à¤°, à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤® à¤•à¥€ à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶à¥‡à¤‚, à¤”à¤° à¤µà¥à¤¯à¤¾à¤µà¤¹à¤¾à¤°à¤¿à¤• à¤¸à¥à¤à¤¾à¤µ à¤¶à¤¾à¤®à¤¿à¤² à¤•à¤°à¥‡à¤‚à¥¤`;
            }
        } else {
            if (prefs.firstCity) cityOrder = ` Start the itinerary from ${prefs.firstCity} first.`;
            if (prefs.startLocation) startInfo = ` I am travelling from ${prefs.startLocation}.`;
            if (isCustomMix && selectedPlacesStr) {
                msg = `Plan a ${prefs.days}-day ${yatraType} itinerary covering ${cities}. I specifically want to visit these places: ${selectedPlacesStr}. Pace: ${paceNames[prefs.pace] || 'moderate'}. Travelling as: ${prefs.group || 'family'}.${startInfo}${cityOrder} I will arrive/start in the ${startTimeStr}. Generate separate Google Maps routes for each city. Include the best temples for darshan, local prasadam recommendations, and practical tips.`;
            } else {
                msg = `Plan a ${prefs.days}-day ${yatraType} itinerary covering ${cities}. My interests include: ${interests}. Pace: ${paceNames[prefs.pace] || 'moderate'}. Travelling as: ${prefs.group || 'family'}.${startInfo}${cityOrder} I will arrive/start in the ${startTimeStr}. Generate separate Google Maps routes for each city. Include the best temples for darshan, local prasadam recommendations, and practical tips.`;
            }
        }

        messageInput.value = msg;
        handleSend();
    }

    async function handleSend() {
        const text = messageInput.value.trim();
        if (!text || isLoading) return;

        if (welcomeScreen) welcomeScreen.style.display = 'none';
        appendMessage('user', text);
        messageInput.value = '';
        messageInput.style.height = 'auto';
        btnSend.disabled = true;
        btnSend.classList.add('hidden');
        btnStop.classList.remove('hidden');

        const typingEl = showTyping();
        isLoading = true;

        currentAbortController = new AbortController();

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ message: text, sessionId, language: currentLanguage }),
                signal: currentAbortController.signal
            });
            const data = await res.json();

            if (data.sessionId) {
                sessionId = data.sessionId;
                localStorage.setItem('brajyatra_session', sessionId);
            }

            removeTyping(typingEl);

            switch (data.type) {
                case 'itinerary':
                    renderItinerary(data.itinerary);
                    break;
                case 'recommend':
                    renderRecommendations(data.recommendations, data.summary);
                    break;
                case 'search':
                    const searchCity = (data.intent && data.intent.cities && data.intent.cities[0]) || '';
                    renderSearchResult(data.intent?.query || 'Search', searchCity, data.text, data.groundingMetadata);
                    break;
                case 'weather_preference':
                    renderWeatherPreference(data);
                    break;
                default:
                    appendMessage('assistant', data.text);
            }
        } catch (error) {
            removeTyping(typingEl);
            if (error.name === 'AbortError') {
                messageInput.value = text;
                btnSend.disabled = false;
            } else {
                appendMessage('assistant', t('error_msg'));
            }
        }

        currentAbortController = null;
        isLoading = false;
        btnStop.classList.add('hidden');
        btnSend.classList.remove('hidden');
        if (messageInput.value.trim().length > 0) btnSend.disabled = false;
        scrollToBottom();
        closeSidebar();
    }

    function stopChat() {
        if (currentAbortController) {
            currentAbortController.abort();
        }
    }

    function isActualPlace(slot) {
        if (!slot || !slot.place) return false;
        if (slot.is_meal) return false;
        const lower = slot.place.toLowerCase();
        const skipPatterns = [
            'travel to', 'travel from', 'transit', 'drive to', 'walk to', 'commute',
            'rest', 'leisure', 'break', 'check-in', 'check in', 'checkout', 'check out',
            'lunch', 'breakfast', 'dinner', 'snack', 'prasadam break', 'food break',
            'ðŸ›'
        ];
        return !skipPatterns.some(pattern => lower.includes(pattern));
    }

    function isMealSlot(slot) {
        if (!slot || !slot.place) return false;
        if (slot.is_meal) return true;
        const lower = slot.place.toLowerCase();
        return lower.includes('lunch') || lower.includes('breakfast') || lower.includes('dinner') ||
            lower.includes('prasadam break') || lower.includes('food break') || lower.includes('ðŸ›');
    }

    function buildPlaceMapUrl(placeName, city) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + ', ' + (city || '') + ', India')}`;
    }

    function buildDayRouteUrl(dayData) {
        const stops = (dayData.slots || [])
            .filter(s => isActualPlace(s))
            .map(s => `${s.place}, ${dayData.city || ''}, India`);
        if (stops.length < 2) {
            return stops.length === 1
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`
                : null;
        }
        const origin = encodeURIComponent(stops[0]);
        const destination = encodeURIComponent(stops[stops.length - 1]);
        const waypoints = stops.slice(1, -1).map(s => encodeURIComponent(s)).join('|');
        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        if (waypoints) url += `&waypoints=${waypoints}`;
        return url;
    }

    function getPlaceImage(placeName, city, category) {
        if (!placeName) return CITY_IMAGES[city] || '/assets/images/krishna_janmabhoomi.avif';
        const lower = placeName.toLowerCase();
        for (const [key, url] of Object.entries(PLACE_IMAGES)) {
            if (lower.includes(key)) return url;
        }
        if (city && CITY_IMAGES[city]) return CITY_IMAGES[city];
        if (category && CATEGORY_IMAGES[category.toLowerCase()]) return CATEGORY_IMAGES[category.toLowerCase()];
        return '/assets/images/krishna_janmabhoomi.avif';
    }

    function getVirtualTourUrl(placeName) {
        if (!placeName) return null;
        const lower = placeName.toLowerCase();
        for (const [key, path] of Object.entries(VIRTUAL_TOURS)) {
            if (lower.includes(key)) return CLIENT_ORIGIN + path;
        }
        return null;
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? 'ðŸ™' : 'à¥';

        const content = document.createElement('div');
        content.className = 'message-content';
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = role === 'assistant' ? renderMarkdown(text) : escapeHtml(text);

        content.appendChild(bubble);
        div.appendChild(avatar);
        div.appendChild(content);
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    const BOOKING_PLATFORMS = [
        { name: 'MakeMyTrip', icon: 'ðŸ”¶', url: 'https://www.makemytrip.com/hotels/hotel-listing', color: '#0057a8' },
        { name: 'Booking.com', icon: 'ðŸŸ¦', url: 'https://www.booking.com/searchresults.html', color: '#003580' },
        { name: 'OYO', icon: 'ðŸ”´', url: 'https://www.oyorooms.com/search', color: '#d32f2f' },
        { name: 'Goibibo', icon: 'ðŸŸ ', url: 'https://www.goibibo.com/hotels', color: '#ec5b24' },
        { name: 'Agoda', icon: 'ðŸŸ£', url: 'https://www.agoda.com', color: '#5c2d91' },
        { name: 'Trivago', icon: 'ðŸ”µ', url: 'https://www.trivago.in', color: '#007faf' }
    ];

    function renderBookingLinks(searchQuery) {
        if (!searchQuery) return;

        const encodedQuery = encodeURIComponent(searchQuery);

        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'booking-platforms';
        sourcesDiv.innerHTML = `
            <div class="booking-header">ðŸ¨ Book Hotels On</div>
            <div class="booking-links">
                ${BOOKING_PLATFORMS.map(p =>
            `<a href="${p.url}?q=${encodedQuery}" target="_blank" rel="noopener" class="booking-link" style="--platform-color: ${p.color}" title="Search on ${escapeHtml(p.name)}">
                        <span class="booking-link-icon">${p.icon}</span>
                        <span class="booking-link-title">${escapeHtml(p.name)}</span>
                    </a>`
        ).join('')}
            </div>
        `;
        messagesContainer.appendChild(sourcesDiv);
        scrollToBottom();
    }

    function renderWeatherPreference(data) {
        pendingWeatherPrefData = data;

        const weather = data.weather;
        const options = data.options;
        const weatherEmoji = weather.is_rainy ? 'ðŸŒ§ï¸' : weather.temp > 32 ? 'ðŸ”¥' : weather.temp < 15 ? 'ðŸ¥¶' : 'ðŸŒ¤ï¸';

        const card = document.createElement('div');
        card.className = 'weather-pref-card';
        card.innerHTML = `
            <div class="weather-pref-header">
                <div class="weather-pref-current">
                    <span class="weather-pref-emoji">${weatherEmoji}</span>
                    <div class="weather-pref-info">
                        <div class="weather-pref-temp">${weather.temp}Â°C</div>
                        <div class="weather-pref-desc">${escapeHtml(weather.description)} in ${escapeHtml(weather.city)}</div>
                        <div class="weather-pref-detail">Feels like ${weather.feels_like}Â°C Â· ðŸ’§ ${weather.humidity}% Â· ðŸ’¨ ${weather.wind_speed} m/s</div>
                    </div>
                </div>
                <div class="weather-pref-message">${escapeHtml(options.message)}</div>
            </div>
            <div class="weather-pref-choices">
                ${options.choices.map(c => `
                    <button class="weather-pref-btn" data-preference="${escapeHtml(c.id)}">
                        <span class="weather-pref-btn-icon">${c.icon}</span>
                        <div class="weather-pref-btn-content">
                            <div class="weather-pref-btn-label">${escapeHtml(c.label)}</div>
                            <div class="weather-pref-btn-desc">${escapeHtml(c.desc)}</div>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;

        card.querySelectorAll('.weather-pref-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pref = btn.dataset.preference;
                card.querySelectorAll('.weather-pref-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                setTimeout(() => sendWithWeatherPreference(pref), 300);
            });
        });

        messagesContainer.appendChild(card);
        scrollToBottom();
    }

    async function sendWithWeatherPreference(preferenceId) {
        if (!pendingWeatherPrefData) return;

        const data = pendingWeatherPrefData;
        const selectedLabel = (data.options.choices.find(c => c.id === preferenceId) || {}).label || preferenceId;
        pendingWeatherPrefData = null;

        // Show user's selection
        appendMessage('user', `${selectedLabel}`);

        const typingEl = showTyping();
        isLoading = true;
        btnSend.classList.add('hidden');
        btnStop.classList.remove('hidden');
        currentAbortController = new AbortController();

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    message: data.originalMessage,
                    sessionId,
                    language: currentLanguage,
                    weather_preference: preferenceId
                }),
                signal: currentAbortController.signal
            });
            const result = await res.json();

            if (result.sessionId) {
                sessionId = result.sessionId;
                localStorage.setItem('brajyatra_session', sessionId);
            }

            removeTyping(typingEl);

            if (result.type === 'itinerary') {
                renderItinerary(result.itinerary);
            } else {
                appendMessage('assistant', result.text || 'Could not generate itinerary.');
            }
        } catch (error) {
            removeTyping(typingEl);
            if (error.name !== 'AbortError') {
                appendMessage('assistant', t('error_msg'));
            }
        }

        currentAbortController = null;
        isLoading = false;
        btnStop.classList.add('hidden');
        btnSend.classList.remove('hidden');
        scrollToBottom();
    }

    async function searchPlace(placeName, city) {
        if (welcomeScreen) welcomeScreen.style.display = 'none';

        const searchMsg = document.createElement('div');
        searchMsg.className = 'message user';
        searchMsg.innerHTML = `
            <div class="message-content" style="display:flex;justify-content:flex-end">
                <div class="message-bubble">ðŸ” Search: ${escapeHtml(placeName)}${city ? ', ' + escapeHtml(city) : ''}</div>
            </div>
            <div class="message-avatar" style="background:var(--gradient-maroon);color:#fff">ðŸ™</div>
        `;
        messagesContainer.appendChild(searchMsg);

        const typingEl = showTyping();
        scrollToBottom();

        try {
            const res = await fetch(`${API_BASE}/search`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ placeName, city })
            });
            const data = await res.json();
            removeTyping(typingEl);

            if (data.error) {
                appendMessage('assistant', 'âŒ ' + data.error);
                return;
            }

            renderSearchResult(placeName, city, data.text, data.groundingMetadata);
        } catch (err) {
            removeTyping(typingEl);
            appendMessage('assistant', 'âŒ Search failed. Please try again.');
        }
    }

    function renderSearchResult(placeName, city, text, groundingMetadata) {
        const mapsUrl = buildPlaceMapUrl(placeName, city);
        const searchQuery = placeName + (city ? ', ' + city : '') + ', India';

        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.innerHTML = `
            <div class="search-result-header">
                <span class="search-result-icon">ðŸ”</span>
                <span class="search-result-title">Search: ${escapeHtml(placeName)}</span>
                <div class="search-result-header-links">
                    <a href="${mapsUrl}" target="_blank" rel="noopener" class="search-header-link" title="View on Google Maps">ðŸ“ Maps</a>
                </div>
            </div>
            <div class="search-result-body">${renderMarkdown(text)}</div>
            <div class="search-result-footer">
                <a href="${mapsUrl}" target="_blank" rel="noopener" class="rec-map-btn">ðŸ“ View on Maps</a>
                <a href="https://www.makemytrip.com/hotels/hotel-listing?q=${encodeURIComponent(searchQuery)}" target="_blank" rel="noopener" class="booking-footer-btn" style="background:linear-gradient(135deg,#0057a8,#003580)">ðŸ”¶ MakeMyTrip</a>
                <a href="https://www.booking.com/searchresults.html?q=${encodeURIComponent(searchQuery)}" target="_blank" rel="noopener" class="booking-footer-btn" style="background:linear-gradient(135deg,#003580,#00224f)">ðŸŸ¦ Booking.com</a>
                <a href="https://www.oyorooms.com/search?q=${encodeURIComponent(searchQuery)}" target="_blank" rel="noopener" class="booking-footer-btn" style="background:linear-gradient(135deg,#d32f2f,#b71c1c)">ðŸ”´ OYO</a>
            </div>
        `;
        messagesContainer.appendChild(card);

        renderBookingLinks(searchQuery);
        scrollToBottom();
    }

    function renderItinerary(itinerary) {
        if (!itinerary) return appendMessage('assistant', 'Could not generate itinerary. Please try again.');

        currentItinerary = JSON.parse(JSON.stringify(itinerary));

        const card = document.createElement('div');
        card.className = 'itinerary-card';
        card.id = 'itinerary-card-' + Date.now();

        const header = document.createElement('div');
        header.className = 'itinerary-header';
        header.innerHTML = `
            <div class="itinerary-header-top">
                <h2>ðŸ›• ${escapeHtml(itinerary.title || 'Your Sacred Yatra')}</h2>
                <button class="edit-toggle-btn" id="edit-toggle-${card.id}">${t('edit_itinerary')}</button>
            </div>
            <p>${escapeHtml(itinerary.summary || '')}</p>
            <div class="itinerary-meta">
                ${itinerary.days ? `<span class="meta-badge">ðŸ“… ${itinerary.days.length} Day${itinerary.days.length > 1 ? 's' : ''}</span>` : ''}
                ${itinerary.best_season ? `<span class="meta-badge">ðŸŒ¸ ${escapeHtml(itinerary.best_season)}</span>` : ''}
                ${itinerary.total_estimated_hours ? `<span class="meta-badge">â±ï¸ ~${Math.round(itinerary.total_estimated_hours)}h total</span>` : ''}
            </div>
        `;
        card.appendChild(header);

        const weather = itinerary.live_weather;
        if (weather) {
            const weatherDiv = document.createElement('div');
            weatherDiv.className = 'weather-banner';
            const weatherEmoji = weather.is_rainy ? 'ðŸŒ§ï¸' : weather.is_hot ? 'â˜€ï¸' : weather.is_cold ? 'ðŸ¥¶' : 'ðŸŒ¤ï¸';
            weatherDiv.innerHTML = `
                <span class="weather-icon">${weatherEmoji}</span>
                <div class="weather-info">
                    <span class="weather-temp">${weather.temp}Â°C</span>
                    <span class="weather-desc"> Â· ${escapeHtml(weather.description)} in ${escapeHtml(weather.city)}</span>
                </div>
                <div class="weather-details">
                    <span class="weather-detail">ðŸ’§ ${weather.humidity}%</span>
                    <span class="weather-detail">ðŸ’¨ ${weather.wind_speed} m/s</span>
                    <span class="weather-detail">ðŸŒ¡ï¸ Feels ${weather.feels_like}Â°C</span>
                </div>
                ${itinerary.weather_notes ? `<div class="weather-warning">âš ï¸ ${escapeHtml(itinerary.weather_notes)}</div>` : ''}
            `;
            card.appendChild(weatherDiv);
        }

        if (itinerary.google_maps_url) {
            const routeLink = document.createElement('a');
            routeLink.className = 'route-btn';
            routeLink.href = itinerary.google_maps_url;
            routeLink.target = '_blank';
            routeLink.rel = 'noopener';
            routeLink.innerHTML = t('view_full_route');
            card.appendChild(routeLink);
        }

        const days = itinerary.days || [];

        const cityGroups = groupDaysByCity(days);
        if (Object.keys(cityGroups).length > 1) {
            const cityRoutesDiv = document.createElement('div');
            cityRoutesDiv.className = 'city-routes-section';
            for (const [city, cityDays] of Object.entries(cityGroups)) {
                const allStops = [];
                for (const day of cityDays) {
                    for (const slot of (day.slots || [])) {
                        if (isActualPlace(slot)) allStops.push(`${slot.place}, ${city}, India`);
                    }
                }
                if (allStops.length < 1) continue;
                let url;
                if (allStops.length === 1) {
                    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(allStops[0])}`;
                } else {
                    const origin = encodeURIComponent(allStops[0]);
                    const destination = encodeURIComponent(allStops[allStops.length - 1]);
                    const waypoints = allStops.slice(1, -1).map(s => encodeURIComponent(s)).join('|');
                    url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
                    if (waypoints) url += `&waypoints=${waypoints}`;
                }
                const cityBtn = document.createElement('a');
                cityBtn.className = 'city-route-btn';
                cityBtn.href = url;
                cityBtn.target = '_blank';
                cityBtn.rel = 'noopener';
                cityBtn.innerHTML = `ðŸ“ ${escapeHtml(city)} Route on Maps`;
                cityRoutesDiv.appendChild(cityBtn);
            }
            card.appendChild(cityRoutesDiv);
        }

        try {
            if (days.length > 0) {
                const tabs = document.createElement('div');
                tabs.className = 'day-tabs';
                days.forEach((day, i) => {
                    const tab = document.createElement('button');
                    tab.className = `day-tab${i === 0 ? ' active' : ''}`;
                    tab.textContent = `Day ${day.day || i + 1}`;
                    tab.dataset.day = i;
                    tab.addEventListener('click', () => switchDay(card, i));
                    tabs.appendChild(tab);
                });
                card.appendChild(tabs);

                days.forEach((day, i) => {
                    const content = document.createElement('div');
                    content.className = `day-content${i > 0 ? ' hidden' : ''}`;
                    content.dataset.day = i;

                    if (day.overview) {
                        const overview = document.createElement('p');
                        overview.className = 'day-overview';
                        overview.textContent = day.overview;
                        content.appendChild(overview);
                    }

                    const dayRouteUrl = day.google_maps_url || buildDayRouteUrl(day);
                    if (dayRouteUrl) {
                        const dayRouteLink = document.createElement('a');
                        dayRouteLink.className = 'day-route-btn';
                        dayRouteLink.href = dayRouteUrl;
                        dayRouteLink.target = '_blank';
                        dayRouteLink.rel = 'noopener';
                        dayRouteLink.innerHTML = t('view_day_route');
                        dayRouteLink.dataset.dayIndex = i;
                        content.appendChild(dayRouteLink);
                    }

                    const slotsContainer = document.createElement('div');
                    slotsContainer.className = 'slots-container';
                    slotsContainer.dataset.dayIndex = i;
                    (day.slots || []).forEach((slot, slotIdx) => {
                        try {
                            slotsContainer.appendChild(createSlotElement(slot, day.city, slotIdx, i));
                        } catch (slotErr) {
                            console.error('[BrajYatra] Error rendering slot:', slotIdx, slot, slotErr);
                        }
                    });
                    content.appendChild(slotsContainer);

                    const addBtn = document.createElement('button');
                    addBtn.className = 'add-place-btn edit-only';
                    addBtn.textContent = t('add_place');
                    addBtn.dataset.dayIndex = i;
                    addBtn.addEventListener('click', () => showAddPlaceForm(addBtn, i, card));
                    content.appendChild(addBtn);

                    card.appendChild(content);
                });
            }
        } catch (dayErr) {
            console.error('[BrajYatra] Error rendering days:', dayErr);
        }

        const tips = itinerary.tips || [];
        if (tips.length > 0) {
            const tipsSection = document.createElement('div');
            tipsSection.className = 'itinerary-tips';
            tipsSection.innerHTML = `
                <h3>ðŸª” Yatra Tips</h3>
                <ul>${tips.map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}</ul>
            `;
            card.appendChild(tipsSection);
        }

        const budget = itinerary.budget;
        if (budget && budget.total > 0) {
            const budgetSection = document.createElement('div');
            budgetSection.className = 'budget-section';

            const levelLabels = { low: 'ðŸ’° Budget', medium: 'ðŸ’¸ Moderate', high: 'ðŸ’Ž Premium' };
            const levelLabel = levelLabels[budget.budget_level] || 'ðŸ’¸ Moderate';
            const total = budget.total;
            const parts = [
                { label: 'Entry Fees', value: budget.entry_fees, color: '#e67e22', icon: 'ðŸŽ«' },
                { label: 'Food', value: budget.food, color: '#27ae60', icon: 'ðŸ›' },
                { label: 'Transport', value: budget.transport, color: '#3498db', icon: 'ðŸš—' },
                { label: 'Accommodation', value: budget.accommodation, color: '#9b59b6', icon: 'ðŸ¨' }
            ].filter(p => p.value > 0);

            const barSegments = parts.map(p =>
                `<div class="budget-bar-segment" style="width:${(p.value / total * 100).toFixed(1)}%;background:${p.color}" title="${p.label}: â‚¹${p.value.toLocaleString('en-IN')}"></div>`
            ).join('');

            const breakdownRows = parts.map(p =>
                `<div class="budget-row">
                    <span class="budget-row-label"><span style="color:${p.color}">${p.icon}</span> ${p.label}</span>
                    <span class="budget-row-value">â‚¹${p.value.toLocaleString('en-IN')}</span>
                </div>`
            ).join('');

            budgetSection.innerHTML = `
                <h3>ðŸ’° Estimated Budget</h3>
                <div class="budget-header-info">
                    <span class="budget-level-badge">${levelLabel}</span>
                    <span class="budget-people">${budget.people || 2} people Â· ${budget.days} day${budget.days > 1 ? 's' : ''}</span>
                </div>
                <div class="budget-total">
                    <span class="budget-total-label">Total Estimated Cost</span>
                    <span class="budget-total-value">â‚¹${total.toLocaleString('en-IN')}</span>
                    <span class="budget-per-person">â‚¹${(budget.per_person || 0).toLocaleString('en-IN')} per person</span>
                </div>
                <div class="budget-bar">${barSegments}</div>
                <div class="budget-breakdown">${breakdownRows}</div>
                ${budget.breakdown_note ? `<p class="budget-note">ðŸ’¡ ${escapeHtml(budget.breakdown_note)}</p>` : ''}
            `;
            card.appendChild(budgetSection);
        }

        const alternates = itinerary.alternate_indoor || [];
        if (alternates.length > 0) {
            const altSection = document.createElement('div');
            altSection.className = 'alternates-section';
            altSection.innerHTML = `
                <h3>ðŸŒ§ï¸ Indoor Alternatives (if weather turns bad)</h3>
                <ul>${alternates.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
            `;
            card.appendChild(altSection);
        }

        messagesContainer.appendChild(card);

        const editBtn = card.querySelector('.edit-toggle-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => toggleEditMode(card));
        }

        scrollToBottom();

        // â”€â”€ Save Itinerary Button (for logged-in users) â”€â”€
        if (authToken) {
            const saveWrap = document.createElement('div');
            saveWrap.className = 'save-itinerary-wrap';
            saveWrap.innerHTML = `
                <button class="save-itinerary-btn" id="save-itin-${card.id}">
                    ðŸ’¾ Save Itinerary
                </button>
                <span class="save-status" id="save-status-${card.id}"></span>
            `;
            card.appendChild(saveWrap);

            const saveBtn = card.querySelector('.save-itinerary-btn');
            saveBtn.addEventListener('click', async () => {
                saveBtn.disabled = true;
                saveBtn.textContent = 'â³ Saving...';
                const statusEl = card.querySelector('.save-status');
                try {
                    const sRes = await fetch(`${USER_API_BASE}/itineraries`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                            title: itinerary.title || 'My Braj Yatra',
                            cities: (itinerary.days || []).reduce((acc, d) => {
                                // Extract city from day-level property (agent format)
                                if (d.city && !acc.includes(d.city)) acc.push(d.city);
                                // Also check slot/place-level cities
                                (d.slots || d.places || []).forEach(p => { if (p.city && !acc.includes(p.city)) acc.push(p.city); });
                                return acc;
                            }, []),
                            days: (itinerary.days || []).length,
                            itinerary: itinerary
                        })
                    });
                    const sData = await sRes.json();
                    if (sData.success) {
                        saveBtn.textContent = 'âœ… Saved!';
                        saveBtn.classList.add('saved');
                        statusEl.textContent = 'Saved to your profile';
                    } else {
                        throw new Error(sData.error);
                    }
                } catch (err) {
                    saveBtn.textContent = 'âŒ Failed';
                    statusEl.textContent = err.message || 'Could not save';
                    setTimeout(() => { saveBtn.textContent = 'ðŸ’¾ Save Itinerary'; saveBtn.disabled = false; }, 2000);
                }
            });
        }
    }

    function groupDaysByCity(days) {
        const groups = {};
        for (const day of (days || [])) {
            const city = day.city || 'Unknown';
            if (!groups[city]) groups[city] = [];
            groups[city].push(day);
        }
        return groups;
    }

    function createSlotElement(slot, city, slotIdx, dayIdx) {
        const slotEl = document.createElement('div');
        const isMeal = isMealSlot(slot);
        if (isMeal) slot.is_meal = true;

        const isPlace = isActualPlace(slot);
        const isTravel = !isPlace && !isMeal;

        let slotClass = 'time-slot';
        if (isMeal) slotClass += ' meal-slot';
        if (isTravel) slotClass += ' travel-slot';

        slotEl.className = slotClass;
        slotEl.dataset.slotIndex = slotIdx;
        slotEl.dataset.dayIndex = dayIdx;

        const mapUrl = isPlace ? (slot.google_maps_url || buildPlaceMapUrl(slot.place, city)) : '';

        const travelIcon = isTravel ? 'ðŸš— ' : '';

        const vrTourUrl = isPlace ? getVirtualTourUrl(slot.place) : null;

        slotEl.innerHTML = `
        <div class="slot-time">
            ${escapeHtml(slot.time || '')}
            <span class="slot-period">${escapeHtml(slot.period || '')}</span>
        </div>
        <div class="slot-info">
            <div class="slot-name">
                ${mapUrl
                ? `<a href="${mapUrl}" target="_blank" rel="noopener" class="place-map-link" title="View on Google Maps">ðŸ“ ${escapeHtml(slot.place || '')}</a>`
                : `${travelIcon}${escapeHtml(slot.place || '')}`}
                ${vrTourUrl ? `<a href="${vrTourUrl}" target="_blank" rel="noopener" class="vr-tour-link" title="Take a 360Â° Virtual Tour">ðŸ”® 360Â° Tour</a>` : ''}
            </div>
            <div class="slot-desc">${escapeHtml(slot.description || '')}</div>
            ${slot.duration_mins ? `<span class="rec-badge" style="margin-top:6px;display:inline-block">â±ï¸ ${slot.duration_mins} min</span>` : ''}
            ${isPlace ? `<span class="rec-badge" style="margin-top:6px;display:inline-block;margin-left:4px">ðŸŽ« ${slot.entry_fee > 0 ? 'â‚¹' + slot.entry_fee : 'Free'}</span>` : ''}
            ${slot.travel_cost_from_previous > 0 ? `<span class="rec-badge" style="margin-top:6px;display:inline-block;margin-left:4px">ðŸš— ~â‚¹${slot.travel_cost_from_previous}</span>` : ''}
            ${slot.tip ? `<span class="slot-tip">ðŸ’¡ ${escapeHtml(slot.tip)}</span>` : ''}
        </div>
        <button class="slot-remove-btn edit-only" title="Remove this place" data-slot="${slotIdx}" data-day="${dayIdx}">âœ•</button>
    `;

        const removeBtn = slotEl.querySelector('.slot-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSlot(dayIdx, slotIdx, slotEl.closest('.itinerary-card'));
            });
        }

        return slotEl;
    }

    function switchDay(card, dayIndex) {
        card.querySelectorAll('.day-tab').forEach((tab, i) => tab.classList.toggle('active', i === dayIndex));
        card.querySelectorAll('.day-content').forEach((content, i) => content.classList.toggle('hidden', i !== dayIndex));
    }

    function toggleEditMode(card) {
        editMode = !editMode;
        card.classList.toggle('edit-mode', editMode);
        const btn = card.querySelector('.edit-toggle-btn');
        if (btn) btn.textContent = editMode ? t('done_editing') : t('edit_itinerary');
    }

    function removeSlot(dayIdx, slotIdx, card) {
        if (!currentItinerary || !currentItinerary.days[dayIdx]) return;
        const removedSlot = currentItinerary.days[dayIdx].slots[slotIdx];
        const removedCity = currentItinerary.days[dayIdx].city;
        currentItinerary.days[dayIdx].slots.splice(slotIdx, 1);
        rerenderDaySlots(card, dayIdx);

        if (removedSlot && isActualPlace(removedSlot)) {
            showReplacementSuggestions(dayIdx, slotIdx, removedSlot, removedCity, card);
        }
    }

    function getItineraryPlaceIds() {
        if (!currentItinerary) return [];
        const ids = [];
        for (const day of (currentItinerary.days || [])) {
            for (const slot of (day.slots || [])) {
                if (slot.place_id) ids.push(slot.place_id);
            }
        }
        return ids;
    }

    async function showReplacementSuggestions(dayIdx, insertIdx, removedSlot, city, card) {

        const container = card.querySelector(`.slots-container[data-day-index="${dayIdx}"]`);
        if (!container) return;

        const existing = container.parentElement.querySelector('.replacement-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.className = 'replacement-panel';
        panel.innerHTML = `
            <div class="replacement-panel-header">
                <h4>âœ¨ Replace "${escapeHtml(removedSlot.place || '')}" with:</h4>
                <button class="replacement-panel-close">âœ•</button>
            </div>
            <div class="replacement-loading">
                <div class="spinner"></div>
                <span>Finding similar places in ${escapeHtml(city || 'this city')}...</span>
            </div>
        `;
        container.after(panel);

        panel.querySelector('.replacement-panel-close').addEventListener('click', () => panel.remove());

        try {
            const excludeIds = getItineraryPlaceIds().join(',');
            const category = removedSlot.category || '';
            const url = `/api/places/suggest?city=${encodeURIComponent(city || '')}&exclude=${encodeURIComponent(excludeIds)}&category=${encodeURIComponent(category)}`;
            const res = await fetch(url);
            const data = await res.json();

            const loading = panel.querySelector('.replacement-loading');
            if (loading) loading.remove();

            if (!data.suggestions || data.suggestions.length === 0) {
                panel.innerHTML += '<p class="replacement-empty">No alternative places found for this city.</p>';
                return;
            }

            const cardsDiv = document.createElement('div');
            cardsDiv.className = 'suggestion-cards';

            data.suggestions.forEach(place => {
                const sCard = document.createElement('div');
                sCard.className = 'suggestion-card';
                sCard.innerHTML = `
                    <div class="suggestion-card-info">
                        <div class="suggestion-card-name">ðŸ“ ${escapeHtml(place.name || '')}</div>
                        <div class="suggestion-card-meta">
                            <span>${escapeHtml(place.category || '')}</span>
                            ${place.estimated_visit_duration ? `<span>â±ï¸ ${place.estimated_visit_duration} min</span>` : ''}
                            ${place.crowd_level ? `<span>ðŸ‘¥ ${escapeHtml(place.crowd_level)}</span>` : ''}
                        </div>
                    </div>
                    <button class="suggestion-add-btn">+ Add</button>
                `;

                sCard.querySelector('.suggestion-add-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const day = currentItinerary.days[dayIdx];
                    if (!day) return;

                    const newSlot = {
                        time: removedSlot.time || 'TBD',
                        period: removedSlot.period || 'custom',
                        place: place.name,
                        place_id: place.id,
                        duration_mins: place.estimated_visit_duration || 60,
                        description: place.description || `Visit ${place.name} in ${city}.`,
                        tip: place.highlight ? 'â­ Must-visit highlight!' : `Crowd: ${place.crowd_level || 'moderate'}`,
                        google_maps_url: buildPlaceMapUrl(place.name, city)
                    };

                    day.slots.splice(insertIdx, 0, newSlot);
                    rerenderDaySlots(card, dayIdx);
                    panel.remove();
                });

                cardsDiv.appendChild(sCard);
            });

            panel.appendChild(cardsDiv);
        } catch (err) {
            console.error('[BrajYatra] Error fetching suggestions:', err);
            const loading = panel.querySelector('.replacement-loading');
            if (loading) loading.innerHTML = '<p class="replacement-empty">Could not load suggestions. Try again later.</p>';
        }
    }

    function rerenderDaySlots(card, dayIdx) {
        const day = currentItinerary.days[dayIdx];
        if (!day) return;
        const container = card.querySelector(`.slots-container[data-day-index="${dayIdx}"]`);
        if (!container) return;
        container.innerHTML = '';
        (day.slots || []).forEach((slot, slotIdx) => {
            container.appendChild(createSlotElement(slot, day.city, slotIdx, dayIdx));
        });

        const routeLink = card.querySelector(`.day-route-btn[data-day-index="${dayIdx}"]`);
        if (routeLink) {
            const newUrl = buildDayRouteUrl(day);
            if (newUrl) {
                routeLink.href = newUrl;
            }
        }
    }

    function showAddPlaceForm(addBtn, dayIdx, card) {

        const existingForm = addBtn.parentElement.querySelector('.add-place-form');
        if (existingForm) { existingForm.remove(); return; }

        const form = document.createElement('div');
        form.className = 'add-place-form';
        form.innerHTML = `
            <input type="text" class="add-place-input" placeholder="Place name (e.g. Prem Mandir)" />
            <input type="text" class="add-place-time" placeholder="Time (e.g. 16:00â€“17:00)" />
            <button class="add-place-confirm">Add â†’</button>
            <button class="add-place-cancel">Cancel</button>
        `;

        addBtn.parentElement.insertBefore(form, addBtn.nextSibling);

        form.querySelector('.add-place-confirm').addEventListener('click', () => {
            const placeName = form.querySelector('.add-place-input').value.trim();
            const time = form.querySelector('.add-place-time').value.trim() || 'TBD';
            if (!placeName) return;

            const day = currentItinerary.days[dayIdx];
            if (!day) return;

            const newSlot = {
                time: time,
                period: 'custom',
                place: placeName,
                duration_mins: 60,
                description: `Visit ${placeName}`,
                google_maps_url: buildPlaceMapUrl(placeName, day.city)
            };

            day.slots.push(newSlot);
            rerenderDaySlots(card, dayIdx);
            form.remove();
        });

        form.querySelector('.add-place-cancel').addEventListener('click', () => form.remove());
    }

    function renderRecommendations(recommendations, summary) {
        if (!recommendations || recommendations.length === 0) {
            return appendMessage('assistant', summary || 'Could not find recommendations. Try asking differently!');
        }
        if (summary) appendMessage('assistant', summary);

        const grid = document.createElement('div');
        grid.className = 'recommendations-grid';

        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'rec-card';
            card.style.cursor = 'pointer';
            const imgUrl = getPlaceImage(rec.name, rec.city, rec.category);
            const mapUrl = buildPlaceMapUrl(rec.name, rec.city);
            const vrTourUrl = getVirtualTourUrl(rec.name);
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent((rec.name || '') + ', ' + (rec.city || '') + ', India')}`;
            card.innerHTML = `
                <img class="rec-card-img" src="${imgUrl}" alt="${escapeHtml(rec.name || '')}" loading="lazy" onerror="this.style.display='none'">
                <div class="rec-card-body">
                    <div class="rec-card-header">
                        <h4><a href="${mapUrl}" target="_blank" rel="noopener" class="place-map-link" title="View on Google Maps">ðŸ“ ${escapeHtml(rec.name || '')}</a>${vrTourUrl ? ` <a href="${vrTourUrl}" target="_blank" rel="noopener" class="vr-tour-link" title="Take a 360Â° Virtual Tour">ðŸ”® 360Â° Tour</a>` : ''}</h4>
                        <span class="rec-category">${escapeHtml(rec.category || '')}</span>
                    </div>
                    <p class="rec-city">ðŸ“ ${escapeHtml(rec.city || '')}</p>
                    <p class="rec-why">${escapeHtml(rec.why || '')}</p>
                    <div class="rec-meta">
                        ${rec.best_time ? `<span class="rec-badge">ðŸ• ${escapeHtml(rec.best_time)}</span>` : ''}
                        ${rec.duration ? `<span class="rec-badge">â±ï¸ ${escapeHtml(rec.duration)}</span>` : ''}
                        ${rec.crowd_level ? `<span class="rec-badge">ðŸ‘¥ ${escapeHtml(rec.crowd_level)}</span>` : ''}
                    </div>
                    ${rec.insider_tip ? `<p class="slot-tip" style="margin-top:10px">ðŸ’¡ ${escapeHtml(rec.insider_tip)}</p>` : ''}
                    <div class="rec-card-actions">
                        <a href="${mapUrl}" target="_blank" rel="noopener" class="rec-map-btn">ðŸ“ View on Maps</a>
                        ${vrTourUrl ? `<a href="${vrTourUrl}" target="_blank" rel="noopener" class="rec-vr-btn">ðŸ”® 360Â° Virtual Tour</a>` : ''}
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('a, button, .rec-card-actions')) return;
                window.open(googleUrl, '_blank');
            });

            grid.appendChild(card);
        });

        messagesContainer.appendChild(grid);
        scrollToBottom();
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.innerHTML = `
            <div class="message-avatar" style="background: var(--gradient-saffron); font-family: var(--font-deva);">à¥</div>
            <div class="typing-dots"><span></span><span></span><span></span></div>
        `;
        messagesContainer.appendChild(div);
        scrollToBottom();
        return div;
    }

    function removeTyping(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

    // â”€â”€ Chat History Loading (for logged-in users) â”€â”€
    async function loadChatHistory() {
        if (!authToken) return;

        const section = document.getElementById('chat-history-section');
        const list = document.getElementById('chat-history-list');
        if (!section || !list) return;

        try {
            const res = await fetch(`${USER_API_BASE}/sessions`, { headers: getAuthHeaders() });
            const data = await res.json();

            if (data.sessions && data.sessions.length > 0) {
                section.classList.remove('hidden');
                list.innerHTML = data.sessions.map(s => {
                    const preview = s.first_message
                        ? (s.first_message.length > 40 ? s.first_message.substring(0, 40) + '...' : s.first_message)
                        : (s.title || 'Chat');
                    const date = new Date(s.updated_at || s.created_at);
                    const timeAgo = getTimeAgo(date);
                    return `<button class="chat-history-item${s.id === sessionId ? ' active' : ''}" data-session-id="${s.id}">
                        <span class="ch-preview">${escapeHtml(preview)}</span>
                        <span class="ch-time">${timeAgo}</span>
                    </button>`;
                }).join('');

                list.querySelectorAll('.chat-history-item').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const sid = btn.dataset.sessionId;
                        loadSession(sid);
                    });
                });
            }
        } catch (e) { console.log('Chat history load error:', e); }
    }

    async function loadSession(sid) {
        try {
            const res = await fetch(`${USER_API_BASE}/sessions/${sid}`, { headers: getAuthHeaders() });
            const data = await res.json();

            sessionId = sid;
            localStorage.setItem('brajyatra_session', sessionId);
            messagesContainer.innerHTML = '';
            if (welcomeScreen) welcomeScreen.classList.add('hidden');

            if (data.messages) {
                data.messages.forEach(msg => {
                    if (msg.role === 'user') {
                        appendMessage('user', msg.content);
                    } else if (msg.role === 'assistant') {
                        try {
                            const parsed = JSON.parse(msg.content);
                            if (Array.isArray(parsed)) {
                                renderItinerary({ days: parsed });
                            } else {
                                appendMessage('assistant', msg.content);
                            }
                        } catch {
                            appendMessage('assistant', msg.content);
                        }
                    }
                });
            }
            scrollToBottom();

            // Highlight active session
            document.querySelectorAll('.chat-history-item').forEach(el => el.classList.remove('active'));
            const activeBtn = document.querySelector(`.chat-history-item[data-session-id="${sid}"]`);
            if (activeBtn) activeBtn.classList.add('active');

            closeSidebar();
        } catch (e) { console.error('Load session error:', e); }
    }

    function getTimeAgo(date) {
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    // Load chat history on page load
    if (authToken) loadChatHistory();

    function scrollToBottom() {
        // Use instant scroll for programmatic scrolling (CSS smooth causes lag)
        requestAnimationFrame(() => {
            messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'instant' });
            // Retry after a short delay to handle dynamic content (images, etc.)
            setTimeout(() => {
                messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'instant' });
            }, 50);
        });
    }

    function startNewChat() {
        sessionId = null;
        localStorage.removeItem('brajyatra_session');
        currentItinerary = null;
        editMode = false;
        messagesContainer.innerHTML = '';
        if (welcomeScreen) {
            messagesContainer.appendChild(welcomeScreen);
            welcomeScreen.style.display = '';
        } else { location.reload(); }
        closeSidebar();
    }

    function renderMarkdown(text) {
        if (!text) return '';
        let html = escapeHtml(text);
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/^[-â€¢] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^---$/gm, '<hr>');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p><h([1-3])>/g, '<h$1>');
        html = html.replace(/<\/h([1-3])><\/p>/g, '</h$1>');
        html = html.replace(/<p><ul>/g, '<ul>');
        html = html.replace(/<\/ul><\/p>/g, '</ul>');
        html = html.replace(/<p><hr><\/p>/g, '<hr>');
        html = html.replace(/<p><\/p>/g, '');
        return html;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function toggleSidebar() {
        sidebar.classList.toggle('open');
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', closeSidebar);
            document.body.appendChild(overlay);
        }
        overlay.classList.toggle('active', sidebar.classList.contains('open'));
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    function openCityPicker(queryKey) {
        pendingCityPickerQueryKey = queryKey;
        const overlay = document.getElementById('city-picker-overlay');
        const grid = document.getElementById('city-picker-grid');
        const title = document.getElementById('city-picker-title');
        if (!overlay || !grid) return;

        const titleMap = {
            'query_darshan': 'city_picker_darshan',
            'query_prasadam': 'city_picker_prasadam',
            'query_weather': 'city_picker_weather'
        };
        if (title) title.textContent = t(titleMap[queryKey] || 'Select a City');

        grid.innerHTML = Object.entries(CITY_IMAGES).map(([name, img]) => `
            <div class="city-picker-item" data-city="${name}">
                <img src="${img}" alt="${name}" loading="lazy">
                <span>${name}</span>
            </div>
        `).join('');

        grid.querySelectorAll('.city-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                const city = item.dataset.city;
                selectCityForQuery(city);
            });
        });

        overlay.classList.remove('hidden');
        closeSidebar();

        const closeBtn = document.getElementById('city-picker-close');
        if (closeBtn) closeBtn.onclick = closeCityPicker;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeCityPicker();
        });
    }

    function closeCityPicker() {
        const overlay = document.getElementById('city-picker-overlay');
        if (overlay) overlay.classList.add('hidden');
        pendingCityPickerQueryKey = null;
    }

    function selectCityForQuery(city) {
        if (!pendingCityPickerQueryKey) return;

        const queryKeyMap = {
            'query_darshan': 'query_darshan_city',
            'query_prasadam': 'query_prasadam_city',
            'query_weather': 'query_weather_city'
        };
        const templateKey = queryKeyMap[pendingCityPickerQueryKey];
        if (!templateKey) return;

        const query = t(templateKey).replace('{city}', city);
        closeCityPicker();
        messageInput.value = query;
        handleSend();
    }

    init();
})();
