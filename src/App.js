import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Header from "./Header";
import Footer from "./Footer";
import Menu from "./Menu";
import Dashboard from "./Dashboard";
import LoginPage from "./Pages/LoginPage/LoginPage";
import Profile from "./Pages/Profile/Profile";
import SoldOrders from "./Pages/OrderManagement/SoldOrders";
import OrderList from "./Pages/OrderManagement/OrderList";

import AcceptedOrders from "./Pages/OrderManagement/AcceptedOrders";
import ViewOrders from "./Pages/OrderManagement/ViewOrders";
import RejectedOrders from "./Pages/OrderManagement/RejectedOrders";
import ShipOrders from "./Pages/OrderManagement/ShipOrders";
import SalesInvoice from "./Pages/InvoiceManagement/SalesInvoice";
import ViewOd from "./Pages/OrderManagement/ViewOd";
import EditOd from "./Pages/OrderManagement/EditOd";
import EditAcceptedOrder from "./Pages/OrderManagement/EditAcceptedOrder";
import ViewShipOrders from "./Pages/OrderManagement/ViewShipOrders";
import ReturnOrders from "./Pages/OrderManagement/ReturnOrders";
import ReturnAccepted from "./Pages/OrderManagement/ReturnAccepted";
import EditAcceptedReturn from "./Pages/OrderManagement/EditAcceptedReturn";
import ViewAcceptedReturn from "./Pages/OrderManagement/ViewAcceptedReturn";
import ViewReturnOrders from "./Pages/OrderManagement/ViewReturnOrders";
import ViewOrderedOrder from "./Pages/OrderManagement/ViewOrderedOrder";
import EditVendorInfo from "./Pages/Profile/EditVendorInfo";
import ViewOrder from "./Pages/OrderManagement/ViewOrder";
import ListWarrantyClaim from "./Pages/WarrantyClaim/ListWarrantyClaim";
import AddWarrantyClaim from "./Pages/WarrantyClaim/AddWarrantyClaim";
import ReplaceWarranty from "./Pages/WarrantyClaim/ReplaceWarranty";
import ListReplaceWarrantyClaim from "./Pages/WarrantyClaim/ListReplaceWarrantyClaim";
import POSInterface from "./Pages/pos/PosInterface";
import ViewWarrantyClaim from "./Pages/WarrantyClaim/ViewWarrantyClaim";
import VendorProfile from "./Pages/VendorProfile";
import BusinessDetails from "./Pages/Setting/BusinessDetails";
import UploadInvoice from "./Pages/OrderManagement/UploadInvoice";
import ViewSalesInvoice from "./Pages/InvoiceManagement/ViewSalesInvoice";
import ReturnRejected from "./Pages/OrderManagement/ReturnRejected";
import ViewRejectedReturn from "./Pages/OrderManagement/ViewRejectedReturn";
import SalesInvoices from "./Pages/InvoiceManagement/SalesInvoices";
import PurchaseReturnInvoice from "./Pages/InvoiceManagement/PurchaseReturnInvoice";
import ViewAcceptedOrders from "./Pages/OrderManagement/ViewAcceptedOrders";
import ViewRejectedOrders from "./Pages/OrderManagement/ViewRejectedOrders";
const App = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firmName, setFirmName] = useState(""); // Firm name state
  const [userEmail, setUserEmail] = useState(null); // Assuming this is for future use

  // Function to fetch firm name based on the email stored in sessionStorage
  const fetchVendorFirmName = async () => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/firmname/email/${email}`
        );
        if (response.ok) {
          const firmData = await response.json(); // Get the JSON data
          console.log(firmData); // Debug: Check the response
          setFirmName(firmData.firmName); // Set firm name in state
        }
      } catch (error) {
        console.error("Error fetching user firmname:", error);
      }
      setLoading(false); // Stop loading once data is fetched
    } else {
      setLoading(false); // Stop loading if no email in sessionStorage
    }
  };

  // Call fetchVendorFirmName when the component mounts
  useEffect(() => {
    fetchVendorFirmName();
  }, []);
  // const firmName = "YourVendorFirmName"; // Example firm name

  return (
    <BrowserRouter basename="/fumavendor">
      <div className="app-background">
        {/* Conditional rendering to show loading spinner while fetching */}
        {loading ? (
          <div>Loading...</div> // Placeholder or loading spinner
        ) : (
          <Routes>
            <Route
              path="*"
              element={
                <Layout userRoles={userRoles}>
                  <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/Dashboard" element={<Dashboard />} />

                    <Route
                      path="/Profile/:vendorFirmName"
                      element={<Profile />}
                    />
                    <Route
                      path="/Profile"
                      element={<Profile vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/EditVendorInfo/:id"
                      element={<EditVendorInfo vendorFirmName={firmName} />}
                    />
                    <Route path="/OrderList" element={<OrderList />} />
                    <Route path="/SoldOrders" element={<SoldOrders />} />
                    {/* Pass firmName to ViewOrders once it's fetched */}
                    <Route
                      path="/ViewOrders"
                      element={<ViewOrders vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/ViewOrderedOrder/:id"
                      element={<ViewOrderedOrder vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/ViewAcceptedOrders/:id"
                      element={<ViewAcceptedOrders vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/ViewRejectedOrders/:id"
                      element={<ViewRejectedOrders vendorFirmName={firmName} />}
                    />

                    <Route
                      path="/AcceptedOrders"
                      element={<AcceptedOrders vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/RejectedOrders"
                      element={<RejectedOrders vendorFirmName={firmName} />}
                    />

                    <Route
                      path="/ShipOrders"
                      element={<ShipOrders vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/SalesInvoice"
                      element={<SalesInvoice vendorFirmName={firmName} />}
                    />
                    <Route path="/SalesInvoices" element={<SalesInvoices />} />
                    <Route
                      path="/PurchaseReturnInvoice"
                      element={
                        <PurchaseReturnInvoice vendorFirmName={firmName} />
                      }
                    />

                    <Route
                      path="/ViewSalesInvoice/:id"
                      element={<ViewSalesInvoice />}
                    />
                    <Route path="/ViewOrder/:id" element={<ViewOrder />} />
                    <Route path="/EditOd/:id" element={<EditOd />} />
                    <Route
                      path="/EditAcceptedOrder/:id"
                      element={<EditAcceptedOrder />}
                    />
                    <Route
                      path="/ViewShipOrders/:id"
                      element={<ViewShipOrders />}
                    />
                    <Route
                      path="/UploadInvoice/:id"
                      element={<UploadInvoice />}
                    />
                    <Route
                      path="/ReturnOrders"
                      element={<ReturnOrders vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/ReturnAccepted"
                      element={<ReturnAccepted vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/ReturnRejected"
                      element={<ReturnRejected vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/ViewReturnOrders/:id"
                      element={<ViewReturnOrders />}
                    />
                    <Route
                      path="/EditAcceptedReturn/:id"
                      element={<EditAcceptedReturn />}
                    />
                    <Route
                      path="/ViewAcceptedReturn/:id"
                      element={<ViewAcceptedReturn />}
                    />
                    <Route
                      path="/ViewRejectedReturn/:id"
                      element={<ViewRejectedReturn />}
                    />
                    <Route
                      path="/ListWarrantyClaim"
                      element={<ListWarrantyClaim vendorFirmName={firmName} />}
                    />

                    <Route
                      path="/ViewWarrantyClaim/:id"
                      element={<ViewWarrantyClaim />}
                    />
                    <Route
                      path="/AddWarrantyClaim"
                      element={<AddWarrantyClaim vendorFirmName={firmName} />}
                    />
                    <Route
                      path="/ReplaceWarranty/:id"
                      element={<ReplaceWarranty />}
                    />
                    <Route
                      path="/ListReplaceWarrantyClaim"
                      element={
                        <ListReplaceWarrantyClaim vendorFirmName={firmName} />
                      }
                    />
                    <Route path="/POSInterface" element={<POSInterface />} />
                    <Route path="/VendorProfile" element={<VendorProfile />} />
                    <Route
                      path="/BusinessDetails"
                      element={<BusinessDetails />}
                    />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
};

// Layout component to conditionally render Header, Menu, and Footer
const Layout = ({ children, userRoles }) => {
  const location = useLocation();

  // Check if current route is an authentication page
  const isAuthPage =
    location.pathname === "/" || location.pathname === "/no-access";
  const [firmName, setFirmName] = useState(""); // Firm name state
  const [loading, setLoading] = useState(true);

  const fetchVendorFirmName = async () => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/firmname/email/${email}`
        );
        if (response.ok) {
          const firmData = await response.json(); // Get the JSON data
          console.log(firmData); // Debug: Check the response
          setFirmName(firmData.firmName); // Set firm name in state
        }
      } catch (error) {
        console.error("Error fetching user firmname:", error);
      }
      setLoading(false); // Stop loading once data is fetched
    } else {
      setLoading(false); // Stop loading if no email in sessionStorage
    }
  };
  // Call fetchVendorFirmName when the component mounts
  useEffect(() => {
    fetchVendorFirmName();
  }, []);

  return (
    <>
      {!isAuthPage && (
        <>
          <Header vendorFirmName={firmName} />
          <Menu userRoles={userRoles} />
        </>
      )}
      <div className="wrapper">{children}</div>
      {!isAuthPage && <Footer />}
    </>
  );
};

export default App;
