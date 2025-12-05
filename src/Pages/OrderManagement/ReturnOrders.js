import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import $ from "jquery";
import { Link, useNavigate } from "react-router-dom";
import { Collapse } from "react-bootstrap";

const ReturnOrders = ({ vendorFirmName }) => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const [columnsVisibility, setColumnsVisibility] = useState({
    vendorAction: true,
    action: true,
    orderDate: true,
    orderId: true,
    referenceNumber: true,
    location: true,
    customer: true,
    TotalItems: true,
    TotalAmount: true,
    totalitems: true,
    additionalNotes: true,
    orderedBy: true,
  });
  const [modalType, setModalType] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [formData, setFormData] = useState({
    orderId: "",
    orderDate: "",
    customerName: "",
    totalQuantityOrdered: "",
    customerAddress: "",
    contactInformation: "",
    custom1: "",
  });

  // State variables for filters
  const [filterValues, setFilterValues] = useState({
    locations: [],
    vendors: [],
  });
  const [activeFilters, setActiveFilters] = useState({
    location: "",
    vendor: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  // Reset filters function
  const resetFilters = () => {
    setActiveFilters({
      location: "",
      vendor: "",
    });
  };

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchase-return/getPendingOrders`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log("Fetched return orders:", data);
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => b.id - a.id);
          setReturnOrders(sortedData);
          setFilteredOrders(sortedData);

          // Extract unique location values for filter
          const locations = [
            ...new Set(sortedData.map((item) => item.location || "")),
          ].filter((location) => location !== "");

          // Extract unique vendor values for filter
          const vendors = [
            ...new Set(sortedData.map((item) => item.vendor || "")),
          ].filter((vendor) => vendor !== "");

          setFilterValues({
            locations,
            vendors,
          });
        } else {
          console.error("Fetched data is not an array");
          setReturnOrders([]);
          setFilteredOrders([]);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setReturnOrders([]);
        setFilteredOrders([]);
      }

      const script = document.createElement("script");
      script.src = "js/JqueryContent.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    fetchPendingOrders();
  }, []);

  // Apply filters whenever activeFilters or returnOrders change
  useEffect(() => {
    const filtered = returnOrders.filter((order) => {
      return (
        (activeFilters.location === "" ||
          order?.location === activeFilters.location) &&
        (activeFilters.vendor === "" || order?.vendor === activeFilters.vendor)
      );
    });
    setFilteredOrders(filtered);
  }, [activeFilters, returnOrders]);

  const exportCSV = () => {
    const csvData = filteredOrders.map((order) => ({
      "Vendor Action": order.vendorAction,
      Action: order.action,
      "Order ID": order.purchaseReturnId,
      "Reference Number": order.referenceNumber,
      Location: order.location,
      Vendor: order.vendor,
      "Total Items": order.totalItems,
      "Additional Notes": order.additionalNotes,
      "Ordered By": order.addedBy,
    }));

    const csv = [
      [
        "Vendor Action",
        "Action",
        "Order ID",
        "Reference Number",
        "Location",
        "Vendor",
        "Total Items",
        "Additional Notes",
        "Ordered By",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "return_orders.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredOrders.map((order) => ({
        "Vendor Action": order.vendorAction,
        Action: order.action,
        "Order ID": order.purchaseReturnId,
        "Reference Number": order.referenceNumber,
        Location: order.location,
        Vendor: order.vendor,
        "Total Items": order.totalItems,
        "Additional Notes": order.additionalNotes,
        "Ordered By": order.addedBy,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Return Orders");
    XLSX.writeFile(wb, "return_orders.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "Vendor Action",
          "Action",
          "Order ID",
          "Reference Number",
          "Location",
          "Vendor",
          "Total Items",
          "Additional Notes",
          "Ordered By",
        ],
      ],
      body: filteredOrders.map((order) => [
        order.vendorAction || "",
        order.action || "",
        order.purchaseReturnId,
        order.referenceNumber,
        order.location || "",
        order.vendor,
        order.totalItems,
        order.additionalNotes,
        order.addedBy || "",
      ]),
    });
    doc.save("return_orders.pdf");
  };

  const printData = () => {
    const tableContainer = document.getElementById("table-container");
    const clonedContainer = tableContainer.cloneNode(true);
    const $clonedContainer = $(clonedContainer);

    $clonedContainer.find(".dataTables_filter").remove();
    $clonedContainer.find(".dataTables_paginate").remove();
    $clonedContainer.find(".dataTables_info").remove();
    $clonedContainer.find("td button").remove();

    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write($clonedContainer.html());
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation();
    toggleColumn(col);
  };

  const handleVendorAction = async (action, order) => {
    if (action === "view") {
      setModalType("view");
      setCurrentOrder(order);
    } else if (action === "accept") {
      const status = 5;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchase-return/updateStatus/${order.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          }
        );

        if (response.ok) {
          fetchPendingOrders();
          alert("Order accepted successfully.");
        } else {
          alert("Failed to update the order status.");
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("An error occurred while updating the order status.");
      }
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchase-return/getPendingOrders`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => b.id - a.id);
        setReturnOrders(sortedData);
        setFilteredOrders(sortedData);
      } else {
        console.error("Fetched data is not an array");
        setReturnOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setReturnOrders([]);
      setFilteredOrders([]);
    }
  };

  const handleVendorActions = async (e, order) => {
    const action = e.target.value;

    if (action === "accept") {
      const userConfirmed = window.confirm(
        "Are you sure you want to accept this Return?"
      );
      if (userConfirmed) {
        navigate(`/EditAcceptedReturn/${order.id}`);
      } else {
        alert("Return acceptance was canceled.");
      }
    } else if (action === "reject") {
      const userConfirmed = window.confirm(
        "Are you sure you want to reject this order?"
      );
      if (userConfirmed) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/purchase-return/updateStatus/${order.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: 2 }), // 2 = rejected
            }
          );

          if (response.ok) {
            alert("Sale Return rejected successfully.");
            fetchPendingOrders(); // refresh the list
          } else {
            alert("Failed to update the order status.");
          }
        } catch (error) {
          console.error("Error updating order status:", error);
          alert("An error occurred while rejecting the order.");
        }
      } else {
        alert("Return rejection was canceled.");
      }
    }
  };

  const handleViewClick = (id) => {
    navigate(`/ViewReturnOrders/${id}`);
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">Return Orders</h1>
                <p>{vendorFirmName}</p>
                <span className="d-inline d-md-block sub-heading">
                  Manage Return Orders
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            {/* Filter Card */}
            <div className="card card-default rounded-4 border-0 cardHover mb-3">
              <div
                className="my- p-3 d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <i className={`fa fa-filter me-3`}></i>
                <span>Filter</span>
              </div>

              <Collapse in={filterOpen}>
                <div className="border-top">
                  <div className="card-body">
                    <div className="row py-2 g-2">
                      {/* Location Dropdown */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="me-2">Location:</label>
                          <select
                            className="form-select"
                            name="location"
                            value={activeFilters.location}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Locations</option>
                            {filterValues.locations.map((location, index) => (
                              <option key={`loc-${index}`} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Vendor Dropdown */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="me-2">Vendor:</label>
                          <select
                            className="form-select"
                            name="vendor"
                            value={activeFilters.vendor}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Vendors</option>
                            {filterValues.vendors.map((vendor, index) => (
                              <option key={`ven-${index}`} value={vendor}>
                                {vendor}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Reset Button */}
                      <div className="col-md-4 d-flex align-items-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={resetFilters}
                          disabled={
                            !activeFilters.location && !activeFilters.vendor
                          }
                        >
                          <i className="fa fa-times me-1"></i> Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>

            <div className="card cardHover rounded-4 border-0">
              <div className="card-body">
                <div className="row mb-3 d-flex align-items-center">
                  <div className="col-12 col-md-auto form-group mb-2 d-flex align-items-center text-bold mt-2 mb-2 mr-2">
                    <label htmlFor="entriesPerPage" className="mb-0 mr-2">
                      Show
                    </label>
                    <select
                      id="entriesPerPage"
                      className="form-control form-control-sm mr-2"
                      value={entriesPerPage}
                      onChange={handleEntriesChange}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={75}>75</option>
                      <option value={100}>100</option>
                    </select>
                    Entries
                  </div>

                  <div className="col d-flex flex-wrap align-items-center">
                    <button
                      onClick={exportCSV}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-csv"></i> Export CSV
                    </button>
                    <button
                      onClick={exportExcel}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-excel"></i> Export Excel
                    </button>
                    <button
                      onClick={printData}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-print"></i> Print
                    </button>
                    <button
                      onClick={exportPDF}
                      className="btn Export-Btn mt-2 mb-2 mr-2"
                    >
                      <i className="fa fa-file-pdf"></i> Export PDF
                    </button>
                    <div className="dropdown mt-lg-2 mb-lg-2">
                      <button
                        className="btn Export-Btn dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="fa fa-columns"></i> Column Visibility
                      </button>
                      <div
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        {Object.keys(columnsVisibility).map((col) => (
                          <div
                            key={col}
                            className="dropdown-item d-flex align-items-center"
                          >
                            <input
                              type="checkbox"
                              checked={columnsVisibility[col]}
                              onChange={() => toggleColumn(col)}
                              className="mr-2"
                            />
                            <span
                              className="btn border-0 bg-transparent p-0 m-0"
                              onClick={(e) => handleDropdownItemClick(col, e)}
                            >
                              {col.replace(/([A-Z])/g, " $1").toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div id="table-container" style={{ overflowX: "auto" }}>
                  <table
                    id="example1"
                    className="table table-bordered table-hover shadow"
                  >
                    <thead>
                      <tr>
                        {columnsVisibility.vendorAction && (
                          <th>Vendor Action&nbsp;&nbsp;&nbsp;&nbsp;</th>
                        )}
                        {columnsVisibility.action && <th>Action</th>}
                        {columnsVisibility.orderDate && (
                          <th>
                            &nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          </th>
                        )}
                        {columnsVisibility.orderId && <th>Return Order ID</th>}
                        {columnsVisibility.referenceNumber && (
                          <th>Reference Number</th>
                        )}

                        {columnsVisibility.customer && <th>Customer</th>}
                        {columnsVisibility.totalitems && (
                          <th>Return Order Quantity</th>
                        )}
                        {columnsVisibility.additionalNotes && (
                          <th>Additional Notes</th>
                        )}
                        {columnsVisibility.TotalItems && <th>Total Items</th>}
                        {columnsVisibility.TotalAmount && <th>Total Amount</th>}
                        {columnsVisibility.orderedBy && <th>Ordered By</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders
                        .filter((order) => order.vendor === vendorFirmName)
                        .slice(startIndex, endIndex)
                        .map((order) => (
                          <tr key={order.id}>
                            {columnsVisibility.vendorAction && (
                              <td>
                                <select
                                  className="form-control form-control-sm"
                                  onChange={(e) =>
                                    handleVendorActions(e, order)
                                  }
                                >
                                  <option value="">Select Action</option>
                                  <option value="accept">Accept</option>
                                  <option value="reject">Reject Return</option>
                                </select>
                              </td>
                            )}

                            {columnsVisibility.action && (
                              <td>
                                <button
                                  onClick={() => handleViewClick(order.id)}
                                  className="btn btn-sm btn-primary"
                                >
                                  View
                                </button>
                              </td>
                            )}
                            {columnsVisibility.orderDate && (
                              <td>{order.orderDate}</td>
                            )}
                            {columnsVisibility.orderId && (
                              <td>{order.purchaseReturnId}</td>
                            )}
                            {columnsVisibility.referenceNumber && (
                              <td>{order.referenceNumber}</td>
                            )}

                            {columnsVisibility.customer && <td>{"Fuma"}</td>}
                            {columnsVisibility.totalitems && (
                              <td>{order.totalItems}</td>
                            )}
                            {columnsVisibility.additionalNotes && (
                              <td>{order.additionalNotes || "N/A"}</td>
                            )}
                            {columnsVisibility.TotalItems && (
                              <td>{order.totalItems || "N/A"}</td>
                            )}
                            {columnsVisibility.TotalAmount && (
                              <td>{order.totalAmount || "N/A"}</td>
                            )}
                            {columnsVisibility.orderedBy && (
                              <td>{order.addedBy || "N/A"}</td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modals for different actions */}
        {modalType && (
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalType === "view"
                      ? "View Order"
                      : modalType === "accept"
                      ? "Accept Order"
                      : "Reject Order"}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setModalType(null)}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {modalType === "view" && currentOrder && (
                    <div>
                      <h5>Order Details:</h5>
                      <p>Return Order ID: {currentOrder.purchaseReturnId}</p>
                      <p>Reference Number: {currentOrder.referenceNumber}</p>
                      <p>Order Date: {currentOrder.orderDate}</p>
                      <p>Vendor: {currentOrder.vendor}</p>
                      <p>Total Items: {currentOrder.totalItems}</p>
                      <p>Location: {currentOrder.location || "N/A"}</p>
                      <p>Ordered By: {currentOrder.addedBy || "N/A"}</p>
                      <p>
                        Additional Notes:{" "}
                        {currentOrder.additionalNotes || "N/A"}
                      </p>
                    </div>
                  )}
                  {modalType === "accept" && (
                    <div>
                      Are you sure you want to accept this return order?
                    </div>
                  )}
                  {modalType === "reject" && (
                    <div>
                      Are you sure you want to reject this return order?
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalType(null)}
                  >
                    Close
                  </button>
                  {(modalType === "accept" || modalType === "reject") && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setModalType(null)}
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnOrders;
