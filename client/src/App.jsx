import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CreateTrip from "./pages/CreateTrip";
import AccountPage from "./pages/AccountPage";

import Agra from "./pages/destinations/agra/Agra";
import Mathura from "./pages/destinations/mathura/Mathura";
import Vrindavan from "./pages/destinations/vrindavan/Vrindavan";
import Gokul from "./pages/destinations/gokul/Gokul";
import Barsana from "./pages/destinations/barsana/Barsana";
import Govardhan from "./pages/destinations/govardhan/Govardhan";

import TajMahal from "./pages/Attractions/TajMahal";
import PlacePage from "./pages/PlacePage";
import ItineraryDetailPage from "./pages/ItineraryDetailPage";
import TravelDiaryDetailPage from "./pages/TravelDiaryDetailPage";

import ScrollToTop from "./components/ScrollToTop";
import StickyCreateTripButton from "./components/StickyCreateTripButton";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalSearch from "./components/GlobalSearch";
import { usePageTracking } from "./hooks/usePageTracking";

/* Virtual Tours */
import VirtualToursIndex from "./pages/virtual-tours/VirtualToursIndex";
import MariamTomb from "./pages/virtual-tours/MariamTomb";
import Sikandra from "./pages/virtual-tours/Sikandra";
import Itmad from "./pages/virtual-tours/Itmad";
import Aram from "./pages/virtual-tours/Aram";
import Chini from "./pages/virtual-tours/Chini";

/* Redirect /attraction/:slug → /place/:slug */
function AttractionRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/place/${slug}`} replace />;
}

/* Redirect /hidden-gems/:gemSlug → /place/:gemSlug */
function HiddenGemRedirect() {
  const { gemSlug } = useParams();
  return <Navigate to={`/place/${gemSlug}`} replace />;
}

/* Redirect /:city/section → /:city#section */
function CitySubRoute({ section }) {
  const { city } = useParams();
  return <Navigate to={`/${city}#${section}`} replace />;
}

function App() {
  usePageTracking(); // GA4 SPA page-view tracking

  return (
    <div>
      <ScrollToTop />
      <StickyCreateTripButton />
      <GlobalSearch />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-trip" element={<CreateTrip />} />

        {/* Protected Routes */}
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

        {/* Destination Pages */}
        <Route path="/agra" element={<Agra />} />
        <Route path="/mathura" element={<Mathura />} />
        <Route path="/vrindavan" element={<Vrindavan />} />
        <Route path="/gokul" element={<Gokul />} />
        <Route path="/barsana" element={<Barsana />} />
        <Route path="/govardhan" element={<Govardhan />} />

        {/* City sub-routes → redirect to city page with hash */}
        <Route path="/:city/attractions" element={<CitySubRoute section="attractions" />} />
        <Route path="/:city/hidden-gems" element={<CitySubRoute section="hidden-gems" />} />
        <Route path="/:city/temples" element={<CitySubRoute section="temples" />} />

        {/* Universal Place Page */}
        <Route path="/place/:slug" element={<PlacePage />} />

        {/* Backwards compatibility redirects */}
        <Route path="/taj" element={<TajMahal />} />
        <Route path="/attraction/:slug" element={<AttractionRedirect />} />
        <Route path="/hidden-gems/:gemSlug" element={<HiddenGemRedirect />} />

        {/* Detail Pages */}
        <Route path="/itineraries/:citySlug" element={<ItineraryDetailPage />} />
        <Route path="/travel-diaries/:diarySlug" element={<TravelDiaryDetailPage />} />

        {/* Virtual Tours */}
        <Route path="/virtual-tours" element={<VirtualToursIndex />} />
        <Route path="/virtual-tours/mariam-tomb" element={<MariamTomb />} />
        <Route path="/virtual-tours/sikandra" element={<Sikandra />} />
        <Route path="/virtual-tours/itmad" element={<Itmad />} />
        <Route path="/virtual-tours/aram" element={<Aram />} />
        <Route path="/virtual-tours/chini-ka-rauza" element={<Chini />} />

        {/* 404 Catch-all — must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
