import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";

import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Tour from "./pages/TourShowtime/Tour";
import Imgtour from "./pages/TourShowtime/Imgtour";
import AptPage from "./pages/AptPages/AptPage";
import ImgAptPage from "./pages/AptPages/ImgAptPage";
import CIFPage from "./pages/CIF/CIFPage";
import PermsPage from "./pages/PermsPage/PermsPage";
import HistoryTourOne from "./components/HistoryOne/HistoryTourOne";
import HistoryAptOne from "./components/HistoryOne/HistoryAptOne";
import Schedule from "./pages/TourShowtime/Schedule";
export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/home" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tour */}
            <Route path="/tour" element={<Tour />} />
            <Route path="/imgtour" element={<Imgtour />} />
            <Route path="/apt" element={<AptPage />} />
            <Route path="/imgapt" element={<ImgAptPage />} />
            <Route path="/cif" element={<CIFPage />} />
            <Route path="/perms" element={<PermsPage />} />
            <Route path="/history-tour" element={<HistoryTourOne />} />
            <Route path="/history-apt" element={<HistoryAptOne />} />
            <Route path="/schedule" element={<Schedule />} />

            {/* Components */}

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
