import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
import AptPage from "./pages/AptPage/AptPage";
import ImgAptPage from "./pages/AptPages/ImgAptPage";
import CIFPage from "./pages/CIF/CIFPage";
import PermsPage from "./pages/PermsPage/PermsPage";
import HistoryTourOne from "./components/HistoryOne/HistoryTourOne";
import HistoryAptOne from "./components/HistoryOne/HistoryAptOne";
import Schedule from "./pages/TourShowtime/Schedule";
import CalendarAPT from "./pages/CalendarAPT";
import Blog from "./components/Blog/Blog";
import StatusBlog from "./components/StatusBlog/StatusBlog";
import AptPayPage from "./pages/AptPaypage/AptPayPage";
import AptOrderHistory from "./pages/AptPageOrderHistory/AptOrderHistory";
export default function App() {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <SignIn />
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/calendarAPT" element={<CalendarAPT />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/tour" element={<Tour />} />
              <Route path="/imgtour" element={<Imgtour />} />
              <Route path="/apt" element={<AptPage />} />
              <Route path="/imgapt" element={<ImgAptPage />} />
              <Route path="/cif" element={<CIFPage />} />
              <Route path="/perms" element={<PermsPage />} />
              <Route path="/history-tour" element={<HistoryTourOne />} />
              <Route path="/history-apt" element={<HistoryAptOne />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/status-blog" element={<StatusBlog />} />
              <Route path="/apt-pay" element={<AptPayPage />} />
              <Route path="/apt-order-history" element={<AptOrderHistory />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
