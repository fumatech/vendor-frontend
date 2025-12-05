import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";

const SalesInvoice = ({ vendorFirmName }) => {
  const [salesInvoice, setSalesInvoice] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const [columnsVisibility, setColumnsVisibility] = useState({
    vendorAction: true,
    action: true,
    orderDate: true,
    orderId: true,
    expectedDate: true,
    referenceNumber: true,
    location: true,
    customer: true,
    totalItems: true,
    updatedItems: true,
    additionalNotes: true,
    orderedBy: true,
    invoice: true,
  });

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

  // Filter state
  const [filterValues, setFilterValues] = useState({
    locations: [],
  });

  const [activeFilters, setActiveFilters] = useState({
    location: "",
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
    fetchSalesInvoice();
  }, []);

  const fetchSalesInvoice = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchaseorder/getShipOrders`
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      console.log("Fetched data:", data);

      if (Array.isArray(data)) {
        // Filter only orders that have invoices uploaded and match vendor
        const filteredData = data.filter(
          (order) =>
            order.file && order.file !== "" && order.vendor === vendorFirmName
        );

        const sortedData = filteredData.sort((a, b) => b.id - a.id);
        setSalesInvoice(sortedData);

        // Extract unique location values for filter
        const locations = [
          ...new Set(sortedData.map((item) => item.location)),
        ].filter(Boolean);

        setFilterValues({
          locations,
        });
      } else {
        console.error("Fetched data is not an array");
        setSalesInvoice([]);
      }
    } catch (error) {
      console.error("Error fetching sales invoices:", error);
      setSalesInvoice([]);
    }
  };

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
    });
  };

  // Filter orders based on active filters
  const filteredOrders = salesInvoice.filter((order) => {
    return (
      activeFilters.location === "" ||
      order?.location === activeFilters.location
    );
  });

  const exportCSV = () => {
    const csvData = filteredOrders.map((order) => ({
      "Order Date": order.orderDate,
      "Order ID": order.purchaseOrderId,
      "Expected Date": order.deliveryDate,
      "Reference Number": order.referenceNumber,
      Location: order.location,
      Customer: order.customerName,
      "Ordered Quantity": order.totalItems,
      "Shipped Quantity": order.totalShippedItems,
      "Additional Notes": order.additionalNotes,
      "Ordered By": order.addedBy,
    }));

    const csv = [
      Object.keys(csvData[0] || {}),
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "sales_invoices.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredOrders.map((order) => ({
        "Order Date": order.orderDate,
        "Order ID": order.purchaseOrderId,
        "Expected Date": order.deliveryDate,
        "Reference Number": order.referenceNumber,
        Location: order.location,
        Customer: order.customerName,
        "Ordered Quantity": order.totalItems,
        "Shipped Quantity": order.totalShippedItems,
        "Additional Notes": order.additionalNotes,
        "Ordered By": order.addedBy,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Invoices");
    XLSX.writeFile(wb, "sales_invoices.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Invoices", 20, 10);
    doc.autoTable({
      startY: 20,
      head: [
        [
          "Order Date",
          "Order ID",
          "Expected Date",
          "Reference Number",
          "Location",
          "Customer",
          "Ordered Qty",
          "Shipped Qty",
          "Additional Notes",
          "Ordered By",
        ],
      ],
      body: filteredOrders.map((order) => [
        order.orderDate || "N/A",
        order.purchaseOrderId || "N/A",
        order.deliveryDate || "N/A",
        order.referenceNumber || "N/A",
        order.location || "N/A",
        order.customerName || "N/A",
        order.totalItems || 0,
        order.totalShippedItems || 0,
        order.additionalNotes || "N/A",
        order.addedBy || "N/A",
      ]),
    });
    doc.save("sales_invoices.pdf");
  };

  const printData = () => {
    const printContent = `
      <html>
        <head>
          <title>Sales Invoices</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            body { font-family: Arial, sans-serif; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h2>Sales Invoices - ${vendorFirmName}</h2>
          <table class="table table-bordered">
            <thead>
              <tr>
                ${columnsVisibility.orderDate ? "<th>Order Date</th>" : ""}
                ${columnsVisibility.orderId ? "<th>Order ID</th>" : ""}
                ${
                  columnsVisibility.expectedDate ? "<th>Expected Date</th>" : ""
                }
                ${
                  columnsVisibility.referenceNumber
                    ? "<th>Reference Number</th>"
                    : ""
                }
                ${columnsVisibility.location ? "<th>Location</th>" : ""}
                ${columnsVisibility.customer ? "<th>Customer</th>" : ""}
                ${columnsVisibility.totalItems ? "<th>Ordered Qty</th>" : ""}
                ${columnsVisibility.updatedItems ? "<th>Shipped Qty</th>" : ""}
                ${
                  columnsVisibility.additionalNotes
                    ? "<th>Additional Notes</th>"
                    : ""
                }
                ${columnsVisibility.orderedBy ? "<th>Ordered By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${filteredOrders
                .map(
                  (order) => `
                <tr>
                  ${
                    columnsVisibility.orderDate
                      ? `<td>${order.orderDate || "N/A"}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.orderId
                      ? `<td>${order.purchaseOrderId || "N/A"}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.expectedDate
                      ? `<td>${order.deliveryDate || "N/A"}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.referenceNumber
                      ? `<td>${order.referenceNumber || "N/A"}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.location
                      ? `<td>${order.location || "N/A"}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.customer
                      ? `<td>${order.customerName || "N/A"}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.totalItems
                      ? `<td>${order.totalItems || 0}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.updatedItems
                      ? `<td>${order.totalShippedItems || 0}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.additionalNotes
                      ? `<td>${order.additionalNotes || "N/A"}</td>`
                      : ""
                  }
                  ${
                    columnsVisibility.orderedBy
                      ? `<td>${order.addedBy || "N/A"}</td>`
                      : ""
                  }
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const handleViewClick = (id) => {
    navigate(`/ViewSalesInvoice/${id}`);
  };

  const handleVendorActions = async (e, order) => {
    const action = e.target.value;

    if (action === "View") {
      navigate(`/ViewSalesInvoice/${order.id}`);
    } else if (action === "viewinvoice") {
      if (order.file) {
        const downloadUrl = `${
          process.env.REACT_APP_BASE_URL
        }/files/download/${order.receipt.split("/").pop()}`;
        window.open(downloadUrl, "_blank");
      } else {
        alert("No receipt available for this return order.");
      }
    }
  };
  const handleCreateInvoice = (id) => {
    navigate(`/UploadInvoice/${id}`);
  };

  const totalPages = Math.ceil(filteredOrders.length / entriesPerPage);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const visibleColumnsCount =
    Object.values(columnsVisibility).filter(Boolean).length;

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">Sales Invoices</h1>
                <p>{vendorFirmName}</p>
                <span className="d-inline d-md-block sub-heading">
                  Manage Sales Invoices
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            {/* Filter Section */}
            <div className="card card-default rounded-4 border-0 cardHover mb-3">
              <div
                className="my- p-3 d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setOpen(!open)}
              >
                <i className={`fa fa-filter me-3 `}></i>
                <span>Filter</span>
              </div>

              <Collapse in={open}>
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

                      {/* Reset Button */}
                      <div className="col-12 mt-3">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetFilters();
                          }}
                          disabled={!Object.values(activeFilters).some(Boolean)}
                        >
                          <i className="fa fa-times me-1"></i> Reset Filter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>
            {/* End Filter Section */}

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
                          <div key={col} className="dropdown-item">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={columnsVisibility[col]}
                                onChange={() => toggleColumn(col)}
                                id={`check-${col}`}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`check-${col}`}
                                style={{ cursor: "pointer" }}
                              >
                                {col.replace(/([A-Z])/g, " $1")}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div id="table-container" style={{ overflowX: "auto" }}>
                  <table className="table table-bordered table-hover shadow">
                    <thead>
                      <tr>
                        {columnsVisibility.vendorAction && (
                          <th>Vendor Action</th>
                        )}
                        {columnsVisibility.orderDate && <th>Order Date</th>}
                        {columnsVisibility.orderId && <th>Order ID</th>}
                        {columnsVisibility.expectedDate && (
                          <th>Expected Date</th>
                        )}
                        {columnsVisibility.referenceNumber && (
                          <th>Reference Number</th>
                        )}
                        {/* {columnsVisibility.location && <th>Location</th>} */}
                        {columnsVisibility.customer && <th>Customer</th>}
                        {columnsVisibility.totalItems && (
                          <th>Ordered Quantity</th>
                        )}
                        {columnsVisibility.updatedItems && (
                          <th>Shipped Quantity</th>
                        )}
                        {columnsVisibility.additionalNotes && (
                          <th>Additional Notes</th>
                        )}
                        {columnsVisibility.orderedBy && <th>Ordered By</th>}
                        {/* {columnsVisibility.invoice && <th>View Invoice</th>} */}
                        {columnsVisibility.action && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order) => (
                          <tr key={order.id || order.orderId}>
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
                            {columnsVisibility.orderDate && (
                              <td>{order.orderDate || "N/A"}</td>
                            )}
                            {columnsVisibility.orderId && (
                              <td>{order.purchaseOrderId || order.orderId}</td>
                            )}
                            {columnsVisibility.expectedDate && (
                              <td>
                                {order.deliveryDate ||
                                  order.expectedDate ||
                                  "N/A"}
                              </td>
                            )}
                            {columnsVisibility.referenceNumber && (
                              <td>{order.referenceNumber || "N/A"}</td>
                            )}
                            {/* {columnsVisibility.location && (
                              <td>{order.location || "N/A"}</td>
                            )} */}
                            {columnsVisibility.customer && (
                              <td>
                                {order.customerName || order.customer || "Fuma"}
                              </td>
                            )}
                            {columnsVisibility.totalItems && (
                              <td>{order.totalItems || 0}</td>
                            )}
                            {columnsVisibility.updatedItems && (
                              <td>
                                {order.totalShippedItems ||
                                  order.updatedItems ||
                                  0}
                              </td>
                            )}
                            {columnsVisibility.additionalNotes && (
                              <td>{order.additionalNotes || "N/A"}</td>
                            )}
                            {columnsVisibility.orderedBy && (
                              <td>
                                {order.addedBy || order.orderedBy || "N/A"}
                              </td>
                            )}
                            {/* {columnsVisibility.invoice && (
                              <td>
                                {order.file ? (
                                  <a
                                    href={`${
                                      process.env.REACT_APP_BASE_URL
                                    }/files/download/${order.file
                                      .split("/")
                                      .pop()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-success btn-sm"
                                  >
                                    <i className="fas fa-download me-1"></i>
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-muted">No Invoice</span>
                                )}
                              </td>
                            )} */}
                            {columnsVisibility.action && (
                              <td>
                                <button
                                  className="btn btn-info btn-sm mr-2"
                                  onClick={printData}
                                >
                                  <i className="fas fa-print"></i> Print
                                </button>
                                <button
                                  className="btn btn-primary btn-sm mr-2"
                                  onClick={() => handleViewClick(order.id)}
                                >
                                  <i className="fas fa-eye"></i> View
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={visibleColumnsCount}
                            className="text-center py-4"
                          >
                            {salesInvoice.length === 0
                              ? "No sales invoices found with uploaded invoices"
                              : "No data matches your current filters"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {filteredOrders.length > 0 && (
                    <div className="row mt-3">
                      <div className="col-sm-12 col-md-5">
                        <div className="dataTables_info">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(endIndex, filteredOrders.length)} of{" "}
                          {filteredOrders.length} entries
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-7">
                        <div className="dataTables_paginate paging_simple_numbers">
                          <ul className="pagination justify-content-end">
                            <li
                              className={`paginate_button page-item previous ${
                                currentPage === 1 ? "disabled" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1)
                                  )
                                }
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                            </li>
                            {[...Array(totalPages)].map((_, index) => (
                              <li
                                key={index}
                                className={`paginate_button page-item ${
                                  currentPage === index + 1 ? "active" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(index + 1)}
                                >
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            <li
                              className={`paginate_button page-item next ${
                                currentPage === totalPages ? "disabled" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                  )
                                }
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalesInvoice;
