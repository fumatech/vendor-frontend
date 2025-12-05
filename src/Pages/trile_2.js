import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "tempusdominus-bootstrap-4/build/css/tempusdominus-bootstrap-4.min.css";
import "icheck-bootstrap/icheck-bootstrap.min.css";
import "jqvmap/dist/jqvmap.min.css";
import "admin-lte/dist/css/adminlte.min.css";
import "daterangepicker/daterangepicker.css";
import "summernote/dist/summernote-bs4.min.css";

const Menu = ({ userRoles }) => {
  const location = useLocation();
  const [sideBarCollapsed, setSideBarCollapsed] = useState(true);
  const [activeMenu, setActiveMenu] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState("");

  const [isSamples, setSamplesopen] = useState(false);
  const [isProfile, setProfileopen] = useState(false);
  const [isOrderManagement, setOrderManagementOpen] = useState(false);
  const [isManageOrders, setManageOrders] = useState(false);
  const [isSalesInvoice, setSalesInvoiceOpen] = useState(false);
  const [isWarrantyClaim, setWarrantyClaimOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;

    // Set dropdown states based on the current path
    setSamplesopen(
      path.startsWith("/ListAllElement") || path.startsWith("/AllFormElements")
    );
    setOrderManagementOpen(
      path.startsWith("/ViewOrders") ||
        path.startsWith("/AcceptedOrders") ||
        path.startsWith("/ShipOrders") ||
        path.startsWith("/RejectedOrders") ||
        path.startsWith("/EditAcceptedOrder") ||
        path.startsWith("/ViewShipOrders") ||
        path.startsWith("/ViewOd") ||
        path.startsWith("/ReturnOrders") ||
        path.startsWith("/ReturnAccepted") ||
        path.startsWith("/EditAcceptedReturn") ||
        path.startsWith("/ViewAcceptedReturn") ||
        path.startsWith("/ViewReturnOrders")
    );
    setWarrantyClaimOpen(
      path.startsWith("/ListWarrantyClaim") ||
        path.startsWith("/ListReplaceWarrantyClaim")
    );

    // Set active menu based on current path
    if (
      path.startsWith("/ListAllElement") ||
      path.startsWith("/AllFormElements")
    ) {
      setActiveMenu("Samples");
    } else if (path.startsWith("/Profile")) {
      setActiveMenu("Profile");
    } else if (
      path.startsWith("/ViewOrders") ||
      path.startsWith("/AcceptedOrders") ||
      path.startsWith("/ShipOrders") ||
      path.startsWith("/EditAcceptedOrder") ||
      path.startsWith("/RejectedOrders") ||
      path.startsWith("/ViewShipOrders") ||
      path.startsWith("/ViewOd") ||
      path.startsWith("/ReturnOrders") ||
      path.startsWith("/ReturnAccepted") ||
      path.startsWith("/EditAcceptedReturn") ||
      path.startsWith("/ViewAcceptedReturn") ||
      path.startsWith("/ViewReturnOrders")
    ) {
      setActiveMenu("OrderManagement");
    } else if (
      path.startsWith("/ListWarrantyClaim") ||
      path.startsWith("/ListReplaceWarrantyClaim")
    ) {
      setActiveMenu("WarrantyClaim");
    } else if (path.startsWith("/SalesInvoice")) {
      setActiveMenu("SalesInvoice");
    } else {
      setActiveMenu("");
    }

    // Set active submenu based on current path
    if (path === "/ListAllElement") {
      setActiveSubMenu("ListAllElement");
    } else if (path === "/Profile") {
      setActiveSubMenu("Profile");
    } else if (path === "/AllFormElements") {
      setActiveSubMenu("AllFormElements");
    } else if (path === "/ViewOrders") {
      setActiveSubMenu("ViewOrders");
    } else if (path === "/AcceptedOrders") {
      setActiveSubMenu("AcceptedOrders");
    } else if (path === "/RejectedOrders") {
      setActiveSubMenu("RejectedOrders");
    } else if (path === "/ShipOrders") {
      setActiveSubMenu("ShipOrders");
    } else if (path.startsWith("/EditAcceptedOrder")) {
      setActiveSubMenu("AcceptedOrders");
    } else if (path.startsWith("/ViewShipOrders")) {
      setActiveSubMenu("ShipOrders");
    } else if (path.startsWith("/ViewOd")) {
      setActiveSubMenu("ViewOrders");
    } else if (path.startsWith("/ReturnOrders")) {
      setActiveSubMenu("ReturnOrders");
    } else if (path.startsWith("/ReturnAccepted")) {
      setActiveSubMenu("ReturnAccepted");
    } else if (path.startsWith("/EditAcceptedReturn")) {
      setActiveSubMenu("ReturnOrders");
    } else if (path.startsWith("/ViewAcceptedReturn")) {
      setActiveSubMenu("ReturnAccepted");
    } else if (path.startsWith("/ViewReturnOrders")) {
      setActiveSubMenu("ReturnOrders");
    } else if (path.startsWith("/ListWarrantyClaim")) {
      setActiveSubMenu("ListWarrantyClaim");
    } else if (path.startsWith("/ListReplaceWarrantyClaim")) {
      setActiveSubMenu("ListReplaceWarrantyClaim");
    } else if (path.startsWith("/SalesInvoice")) {
      setActiveSubMenu("SalesInvoice");
    } else {
      setActiveSubMenu("");
    }
  }, [location]);

  const toggleDropdown = (dropdown) => {
    if (dropdown === "Profile") {
      setProfileopen((prev) => !prev);
      setOrderManagementOpen(false);
      setSalesInvoiceOpen(false);
      setWarrantyClaimOpen(false);
    } else if (dropdown === "OrderManagement") {
      setOrderManagementOpen((prev) => !prev);
      setProfileopen(false);
      setSalesInvoiceOpen(false);
      setWarrantyClaimOpen(false);
    } else if (dropdown === "ManageOrders") {
      setManageOrders((prev) => !prev);
      setProfileopen(false);
      setSalesInvoiceOpen(false);
      setWarrantyClaimOpen(false);
    } else if (dropdown === "WarrantyClaim") {
      setWarrantyClaimOpen((prev) => !prev);
      setProfileopen(false);
      setOrderManagementOpen(false);
      setSalesInvoiceOpen(false);
    } else if (dropdown === "SalesInvoice") {
      setSalesInvoiceOpen((prev) => !prev);
      setProfileopen(false);
      setOrderManagementOpen(false);
      setWarrantyClaimOpen(false);
    }
  };

  const handleSidebarCollapse = () => {
    setSideBarCollapsed((prev) => !prev);
  };

  const getMenuItemClass = (menuName) => {
    return activeMenu === menuName ? "nav-link active" : "nav-link";
  };

  const getSubMenuItemClass = (subMenuName) => {
    return activeSubMenu === subMenuName ? "nav-link active" : "nav-link";
  };

  return (
    <div>
    <aside
      className={`main-sidebar sidebar-elevation-1 ${
        sideBarCollapsed ? "sidebar-collapse" : ""
      }`}
      style={{ minHeight: "100vh" }}
    >
      <div className="sidebar p-0 invisible-scroll">
        <div className="user-panel pt-2 mb-3 d-flex align-content-center justify-content-center">
          <div className="info text-light">
            <h4>Fuma</h4>
          </div>
        </div>
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
          >
            {/* Profile */}
            <li className={`nav-item ${activeMenu === "Profile" ? "menu-open" : ""}  mb-2  `}>
              <a
                href="#"
                className={getMenuItemClass("Profile")}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("Profile");
                  setActiveMenu("Profile");
                }}
                style={{
                  borderLeft: activeMenu === "Profile" ? "3px solid #0040C1" : "none",
                  backgroundColor: activeMenu === "Profile" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <i className="nav-icon fa-regular fa-user" style={{ color: "#4b5565" }} />
                <p style={{ color: activeMenu === "Profile" ? "#0040C1" : "#4b5565" }} className="ms-1">
                  Profile
                  <i className="right fas fa-angle-left" style={{ color: "#4b5565" }} />
                </p>
              </a>
              <ul
                className="nav nav-treeview"
                style={{
                  display: isProfile ? "block" : "none",
                  backgroundColor: activeMenu === "Profile" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <li className="nav-item">
                  <Link
                    to="/Profile"
                    className={getSubMenuItemClass("Profile")}
                    style={{
                      color: activeSubMenu === "Profile" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "Profile" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>Profile</p>
                  </Link>
                </li>
              </ul>
            </li>
  
             {/* Order Management */}
             <li className={`nav-item ${activeMenu === "OrderManagement" ? "menu-open" : ""}  mb-2  `}>
              <a
                href="#"
                className={getMenuItemClass("OrderManagement")}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("OrderManagement");
                  setActiveMenu("OrderManagement");
                }}
                style={{
                  borderLeft: activeMenu === "OrderManagement" ? "3px solid #0040C1" : "none",
                  backgroundColor: activeMenu === "OrderManagement" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <i className="nav-icon fa-regular fa-user" style={{ color: "#4b5565" }} />
                <p style={{ color: activeMenu === "OrderManagement" ? "#0040C1" : "#4b5565" }} className="ms-1">
                  Order Management
                  <i className="right fas fa-angle-left" style={{ color: "#4b5565" }} />
                </p>
              </a>
              <ul
                className="nav nav-treeview"
                style={{
                  display: isOrderManagement ? "block" : "none",
                  backgroundColor: activeMenu === "OrderManagement" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <li className="nav-item">
                  <Link
                    to="/ViewOrders"
                    className={getSubMenuItemClass("ViewOrders")}
                    style={{
                      color: activeSubMenu === "ViewOrders" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "ViewOrders" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>View Orders</p>
                  </Link>
                </li>
  
                <li className={`nav-item ${activeSubMenu === "ManageOrders" ? "menu-open" : ""}  mb-2  `}>
                  <a
                    href="#"
                    className={getSubMenuItemClass("ManageOrders")}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown("ManageOrders");
                    }}
                    style={{
                      color: (activeSubMenu === "AcceptedOrders" || activeSubMenu === "RejectedOrders") ? "#0040C1" : "#4b5565",
                      paddingLeft: "52px"
                    }}
                  >
                    <p style={{ color: (activeSubMenu === "AcceptedOrders" || activeSubMenu === "RejectedOrders") ? "#0040C1" : "#4b5565" }} className="ms-1">
                      Manage Orders
                      <i className="right fas fa-angle-left" style={{ color: "#4b5565" }} />
                    </p>
                  </a>
                  <ul className="nav nav-treeview" style={{ display: isManageOrders ? "block" : "none" }}>
                    <li className="nav-item">
                      <Link
                        to="/AcceptedOrders"
                        className={getSubMenuItemClass("AcceptedOrders")}
                        style={{
                          color: activeSubMenu === "AcceptedOrders" ? "#0040C1" : "#4b5565",
                          backgroundColor: activeSubMenu === "AcceptedOrders" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                          paddingLeft: "72px"
                        }}
                      >
                        <p>Accepted Orders</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/RejectedOrders"
                        className={getSubMenuItemClass("RejectedOrders")}
                        style={{
                          color: activeSubMenu === "RejectedOrders" ? "#0040C1" : "#4b5565",
                          backgroundColor: activeSubMenu === "RejectedOrders" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                          paddingLeft: "72px"
                        }}
                      >
                        <p>Rejected Orders</p>
                      </Link>
                    </li>
                  </ul>
                </li>
  
                <li className="nav-item">
                  <Link
                    to="/ShipOrders"
                    className={getSubMenuItemClass("ShipOrders")}
                    style={{
                      color: activeSubMenu === "ShipOrders" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "ShipOrders" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>Ship Orders</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/ReturnOrders"
                    className={getSubMenuItemClass("ReturnOrders")}
                    style={{
                      color: activeSubMenu === "ReturnOrders" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "ReturnOrders" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>Return Orders</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/ReturnAccepted"
                    className={getSubMenuItemClass("ReturnAccepted")}
                    style={{
                      color: activeSubMenu === "ReturnAccepted" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "ReturnAccepted" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>Accepted Return orders</p>
                  </Link>
                </li>
              </ul>
            </li>
  
            {/* Warranty Claim */}
            <li className={`nav-item ${activeMenu === "WarrantyClaim" ? "menu-open" : ""}  mb-2  `}>
              <a
                href="#"
                className={getMenuItemClass("WarrantyClaim")}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("WarrantyClaim");
                  setActiveMenu("WarrantyClaim");
                }}
                style={{
                  borderLeft: activeMenu === "WarrantyClaim" ? "3px solid #0040C1" : "none",
                  backgroundColor: activeMenu === "WarrantyClaim" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <i className="nav-icon fa-regular fa-user" style={{ color: "#4b5565" }} />
                <p style={{ color: activeMenu === "WarrantyClaim" ? "#0040C1" : "#4b5565" }} className="ms-1" >
                  Warranty Claim
                  <i className="right fas fa-angle-left" style={{ color: "#4b5565" }} />
                </p>
              </a>
              <ul
                className="nav nav-treeview"
                style={{
                  display: isWarrantyClaim ? "block" : "none",
                  backgroundColor: activeMenu === "WarrantyClaim" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <li className="nav-item">
                  <Link
                    to="/ListWarrantyClaim"
                    className={getSubMenuItemClass("ListWarrantyClaim")}
                    style={{
                      color: activeSubMenu === "ListWarrantyClaim" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "ListWarrantyClaim" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>List Warranty Claim</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/ListReplaceWarrantyClaim"
                    className={getSubMenuItemClass("ListReplaceWarrantyClaim")}
                    style={{
                      color: activeSubMenu === "ListReplaceWarrantyClaim" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "ListReplaceWarrantyClaim" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>List Replace Warranty</p>
                  </Link>
                </li>
              </ul>
            </li>
  
            {/* Invoice Management */}
            <li className={`nav-item ${activeMenu === "SalesInvoice" ? "menu-open" : ""}  mb-2  `}>
              <a
                href="#"
                className={getMenuItemClass("SalesInvoice")}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("SalesInvoice");
                  setActiveMenu("SalesInvoice");
                }}
                style={{
                  borderLeft: activeMenu === "SalesInvoice" ? "3px solid #0040C1" : "none",
                  backgroundColor: activeMenu === "SalesInvoice" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <i className="nav-icon fa-regular fa-user" style={{ color: activeMenu === "SalesInvoice" ? "#0040C1" : "#4b5565" }} />
                <p style={{ color: activeMenu === "SalesInvoice" ? "#0040C1" : "#4b5565" }} className="ms-1">
                  Invoice Management
                  <i className="right fas fa-angle-left" style={{ color: activeMenu === "SalesInvoice" ? "#0040C1" : "#4b5565" }} />
                </p>
              </a>
              <ul
                className="nav nav-treeview"
                style={{
                  display: isSalesInvoice ? "block" : "none",
                  backgroundColor: activeMenu === "SalesInvoice" ? "rgba(0, 64, 193, 0.05)" : "transparent"
                }}
              >
                <li className="nav-item">
                  <Link
                    to="/SalesInvoice"
                    className={getSubMenuItemClass("SalesInvoice")}
                    style={{
                      color: activeSubMenu === "SalesInvoice" ? "#0040C1" : "#4b5565",
                      backgroundColor: activeSubMenu === "SalesInvoice" ? "rgba(0, 64, 193, 0.08)" : "transparent",
                      paddingLeft: "52px"
                    }}
                  >
                    <p>Sales Invoice</p>
                  </Link>
                </li>
              </ul>
            </li>
  
          </ul>
        </nav>
      </div>
    </aside>
    <div className="overlay" onClick={() => handleSidebarCollapse()} />
  </div>
  
  
  );
};

export default Menu;