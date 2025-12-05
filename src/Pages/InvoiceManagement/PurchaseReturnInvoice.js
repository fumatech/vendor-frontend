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

const PurchaseReturnInvoice = ({ vendorFirmName }) => {
  const [returnAccepted, setReturnAccepted] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    vendorAction: true,
    orderDate: true,
    orderId: true,
    referenceNumber: true,
    location: true,
    customer: true,
    TotalItems: true,
    TotalAmount: true,
    totalitems: true,
    additionalNotes: true,
    paymentStatus: true,
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
    const fetchAcceptedOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchase-return/getAcceptedOrders`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log(data);
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => b.id - a.id);
          const ordersWithPaymentStatus = initializePaymentStatus(sortedData);

          // Filter orders to only show those with receipts
          const ordersWithReceipts = ordersWithPaymentStatus.filter(
            (order) => order.receipt && order.receipt.trim() !== ""
          );

          setReturnAccepted(ordersWithReceipts);
          setFilteredOrders(ordersWithReceipts);

          // Extract unique location values for filter
          const locations = [
            ...new Set(ordersWithReceipts.map((item) => item.location || "")),
          ].filter((location) => location !== "");

          // Extract unique vendor values for filter
          const vendors = [
            ...new Set(ordersWithReceipts.map((item) => item.vendor || "")),
          ].filter((vendor) => vendor !== "");

          setFilterValues({
            locations,
            vendors,
          });
        } else {
          console.error("Fetched data is not an array");
          setReturnAccepted([]);
          setFilteredOrders([]);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setReturnAccepted([]);
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

    fetchAcceptedOrders();
  }, []);

  const handleVendorActions = async (e, order) => {
    const action = e.target.value;

    if (action === "View") {
      navigate(`/ViewAcceptedReturn/${order.id}`);
    } else if (action === "viewinvoice") {
      // Handle view invoice - download receipt
      if (order.receipt) {
        // Create download link for receipt
        const downloadUrl = `${
          process.env.REACT_APP_BASE_URL
        }/files/download/${order.receipt.split("/").pop()}`;
        window.open(downloadUrl, "_blank");
      } else {
        alert("No receipt available for this return order.");
      }
    }
  };

  // Apply filters whenever activeFilters or returnAccepted change
  useEffect(() => {
    const filtered = returnAccepted.filter((order) => {
      return (
        (activeFilters.location === "" ||
          order?.location === activeFilters.location) &&
        (activeFilters.vendor === "" || order?.vendor === activeFilters.vendor)
      );
    });
    setFilteredOrders(filtered);
  }, [activeFilters, returnAccepted]);

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      // Update locally for better UX
      const updatedOrders = filteredOrders.map((order) =>
        order.id === orderId ? { ...order, paymentStatus: newStatus } : order
      );
      setFilteredOrders(updatedOrders);
      setReturnAccepted(updatedOrders);

      // Make API call to backend
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchase-return/updatePaymentStatus/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: newStatus }),
        }
      );

      if (!response.ok) {
        alert("Payment Status Failed To Update.....!!!");
      }

      alert("Payment Status Updated.....!!!");
    } catch (error) {
      console.error("❌ Error updating payment status:", error);

      // Revert if API fails
      const originalOrders = filteredOrders.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus: order.paymentStatus }
          : order
      );
      setFilteredOrders(originalOrders);
      setReturnAccepted(originalOrders);
      alert("Failed to update payment status. Please try again.");
    }
  };

  // Helper function for styling based on status
  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "payment-status-pending";
      case "refunded":
        return "payment-status-refunded";
      case "credit_note":
        return "payment-status-credit-note";
      case "issued":
        return "payment-status-issued";
      default:
        return "payment-status-pending";
    }
  };

  // Initialize payment status for existing orders
  const initializePaymentStatus = (orders) => {
    return orders.map((order) => ({
      ...order,
      paymentStatus: order.paymentStatus || "pending", // Default to pending if not set
    }));
  };

  // Add CSS styles for payment status
  const paymentStatusStyles = `
    .payment-status-pending {
      background-color: #fff3cd !important;
      color: #856404 !important;
      border-color: #ffeaa7 !important;
    }
    .payment-status-refunded {
      background-color: #d1edff !important;
      color: #0c5460 !important;
      border-color: #bee5eb !important;
    }
    .payment-status-credit-note {
      background-color: #d4edda !important;
      color: #155724 !important;
      border-color: #c3e6cb !important;
    }
    .payment-status-issued {
      background-color: #e2e3e5 !important;
      color: #383d41 !important;
      border-color: #d6d8db !important;
    }
    .payment-status-select {
      min-width: 140px !important;
      font-weight: 600 !important;
      border: 2px solid !important;
      cursor: pointer !important;
    }
    .payment-status-select:focus {
      box-shadow: none !important;
      border-color: inherit !important;
    }
  `;

  const exportCSV = () => {
    const csvData = filteredOrders.map((order) => ({
      "Vendor Action": order.vendorAction,
      Action: order.action,
      "Order ID": order.purchaseReturnId,
      "Reference Number": order.referenceNumber,
      Location: order.location,
      Vendor: order.vendor,
      "Total Items": order.totalItems,
      "Updated Items": order.totalShippedItems,
      "Additional Notes": order.additionalNotes,
      "Ordered By": order.addedBy,
      "Payment Status": order.paymentStatus || "pending",
      Receipt: order.receipt ? "Available" : "No Receipt",
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
        "Updated Items",
        "Additional Notes",
        "Ordered By",
        "Payment Status",
        "Receipt",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "accepted_return_orders.csv");
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
        "Updated Items": order.totalShippedItems,
        "Additional Notes": order.additionalNotes,
        "Ordered By": order.addedBy,
        "Payment Status": order.paymentStatus || "pending",
        Receipt: order.receipt ? "Available" : "No Receipt",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accepted Return Orders");
    XLSX.writeFile(wb, "accepted_return_orders.xlsx");
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
          "Updated Items",
          "Additional Notes",
          "Ordered By",
          "Payment Status",
          "Receipt",
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
        order.totalShippedItems || "",
        order.additionalNotes,
        order.addedBy || "",
        order.paymentStatus || "pending",
        order.receipt ? "Available" : "No Receipt",
      ]),
    });
    doc.save("accepted_return_orders.pdf");
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
    } else {
      const status = action === "accept" ? 1 : 2;
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
          fetchAcceptedOrders();
          alert(`Order ${action}ed successfully.`);
        } else {
          alert("Failed to update the order status.");
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("An error occurred while updating the order status.");
      }
    }
  };

  const fetchAcceptedOrders = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchase-return/getAcceptedOrders`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => b.id - a.id);
        const ordersWithPaymentStatus = initializePaymentStatus(sortedData);

        // Filter orders to only show those with receipts
        const ordersWithReceipts = ordersWithPaymentStatus.filter(
          (order) => order.receipt && order.receipt.trim() !== ""
        );

        setReturnAccepted(ordersWithReceipts);
        setFilteredOrders(ordersWithReceipts);
      } else {
        console.error("Fetched data is not an array");
        setReturnAccepted([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
      setReturnAccepted([]);
      setFilteredOrders([]);
    }
  };

  const handleViewClick = (id) => {
    navigate(`/ViewAcceptedReturn/${id}`);
  };

  return (
    <div className="wrapper">
      {/* Add custom styles for payment status */}
      <style>{paymentStatusStyles}</style>

      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">Sales Return Invoice</h1>
                <p>{vendorFirmName}</p>
                <span className="d-inline d-md-block sub-heading">
                  Manage Sales Return Invoice
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
                          <th>Vendor Action</th>
                        )}

                        {/* {columnsVisibility.action && <th>Action</th>} */}
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
                        {columnsVisibility.paymentStatus && (
                          <th>Payment Status</th>
                        )}
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
                                  defaultValue=""
                                >
                                  <option value="" disabled>
                                    Select Action
                                  </option>
                                  <option value="View">View</option>
                                  <option value="viewinvoice">
                                    View Invoice
                                  </option>
                                </select>
                              </td>
                            )}
                            {/* {columnsVisibility.action && (
                              <td>
                                <button
                                  onClick={() => handleViewClick(order.id)}
                                  className="btn btn-sm btn-primary"
                                >
                                  View
                                </button>
                              </td>
                            )} */}
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
                            {columnsVisibility.paymentStatus && (
                              <td>
                                <select
                                  value={order.paymentStatus ?? 0}
                                  disabled
                                  onChange={(e) =>
                                    handlePaymentStatusChange(
                                      order.id,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className={`form-select form-select-sm payment-status-select ${getPaymentStatusClass(
                                    order.paymentStatus ?? 0
                                  )}`}
                                  style={{ minWidth: "140px" }}
                                >
                                  <option value={0}>Pending</option>
                                  <option value={1}>Refunded</option>
                                  <option value={2}>Credit Note</option>
                                  <option value={3}>Issued</option>
                                </select>
                              </td>
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
                      <p>
                        Updated Items: {currentOrder.totalShippedItems || "N/A"}
                      </p>
                      <p>Location: {currentOrder.location || "N/A"}</p>
                      <p>Ordered By: {currentOrder.addedBy || "N/A"}</p>
                      <p>
                        Additional Notes:{" "}
                        {currentOrder.additionalNotes || "N/A"}
                      </p>
                      <p>
                        Payment Status:{" "}
                        {currentOrder.paymentStatus || "pending"}
                      </p>
                      <p>
                        Receipt:{" "}
                        {currentOrder.receipt ? (
                          <a
                            href={`${
                              process.env.REACT_APP_BASE_URL
                            }/files/download/${currentOrder.receipt
                              .split("/")
                              .pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-success"
                          >
                            <i className="fas fa-download me-1"></i> Download
                            Receipt
                          </a>
                        ) : (
                          "No Receipt"
                        )}
                      </p>
                    </div>
                  )}
                  {modalType === "accept" && (
                    <div>Are you sure you want to accept this order?</div>
                  )}
                  {modalType === "reject" && (
                    <div>Are you sure you want to reject this order?</div>
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

export default PurchaseReturnInvoice;
