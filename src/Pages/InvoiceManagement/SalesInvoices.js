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
import Collapse from "react-bootstrap/Collapse";

const SalesInvoices = ({ vendorFirmName }) => {
  const [shipOrders, setShipOrders] = useState([]);
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
    fetchShipOrders();
  }, []);

  const fetchShipOrders = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchaseorder/getShipOrders`
      );
      console.log(response.data);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => b.id - a.id);
        setShipOrders(sortedData);

        // Extract unique location values for filter
        const locations = [
          ...new Set(sortedData.map((item) => item.location)),
        ].filter(Boolean);

        setFilterValues({
          locations,
        });
      } else {
        console.error("Fetched data is not an array");
        setShipOrders([]);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setShipOrders([]);
    }

    // Add external script
    const script = document.createElement("script");
    script.src = "js/JqueryContent.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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
  const filteredOrders = shipOrders.filter((order) => {
    return (
      (activeFilters.location === "" ||
        order?.location === activeFilters.location) &&
      order.vendor === vendorFirmName
    );
  });

  const exportCSV = () => {
    const csvData = filteredOrders.map((order) => ({
      "Vendor Action": order.vendorAction,
      Action: order.action,
      "Order ID": order.orderId,
      "Reference Number": order.referenceNumber,
      Location: order.location,
      Customer: order.customerName,
      "Total Items": order.totalItems,
      "Updated Items": order.updatedItems,
      "Additional Notes": order.additionalNotes,
      "Ordered By": order.orderedBy,
    }));

    const csv = [
      [
        "Vendor Action",
        "Action",
        "Order ID",
        "Reference Number",
        "Location",
        "Customer",
        "Total Items",
        "Updated Items",
        "Additional Notes",
        "Ordered By",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "orders.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredOrders.map((order) => ({
        "Vendor Action": order.vendorAction,
        Action: order.action,
        "Order ID": order.orderId,
        "Reference Number": order.referenceNumber,
        Location: order.location,
        Customer: order.customerName,
        "Total Items": order.totalItems,
        "Updated Items": order.updatedItems,
        "Additional Notes": order.additionalNotes,
        "Ordered By": order.orderedBy,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
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
          "Customer",
          "Total Items",
          "Updated Items",
          "Additional Notes",
          "Ordered By",
        ],
      ],
      body: filteredOrders.map((order) => [
        order.vendorAction,
        order.action,
        order.orderId,
        order.referenceNumber,
        order.location,
        order.customerName,
        order.totalItems,
        order.updatedItems,
        order.additionalNotes,
        order.orderedBy,
      ]),
    });
    doc.save("orders.pdf");
  };

  const printData = () => {
    const tableContainer = document.getElementById("table-container");
    const clonedContainer = tableContainer.cloneNode(true);
    const $clonedContainer = $(clonedContainer);

    $clonedContainer.find(".dataTables_filter").remove();
    $clonedContainer.find(".dataTables_paginate").remove();
    $clonedContainer.find(".dataTables_info").remove();
    $clonedContainer.find("td button").remove();

    $clonedContainer.find("th:last-child").remove();
    $clonedContainer.find("td:last-child").remove();

    $clonedContainer.find("thead th:nth-child(8)").text("Shipped Quantity");
    $clonedContainer.find("tbody td:nth-child(8)").each((index, td) => {
      const order = filteredOrders[index];
      td.innerText = order.totalShippedItems;
    });

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

  const handleViewClick = (id) => {
    navigate(`/ViewShipOrders/${id}`);
  };

  const handleCreateInvoice = (id) => {
    navigate(`/UploadInvoice/${id}`);
  };

  const handleVendorActions = (e, order) => {
    if (e.target.value === "View") {
      navigate(`/EditOd/${order.id}`);
    }
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">Ship Orders</h1>
                <p>{vendorFirmName}</p>
                <span className="d-inline d-md-block sub-heading">
                  Manage View Orders
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
                        {columnsVisibility.orderDate && (
                          <th>
                            Ordered
                            Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          </th>
                        )}
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
                          <th>ordered Quantity</th>
                        )}
                        {columnsVisibility.updatedItems && (
                          <th>Shipped Quantity</th>
                        )}
                        {columnsVisibility.additionalNotes && (
                          <th>Additional Notes</th>
                        )}
                        {columnsVisibility.orderedBy && <th>Ordered By</th>}
                        {columnsVisibility.invoice && <th>View Invoice</th>}

                        {columnsVisibility.action && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders
                        .slice(startIndex, endIndex)
                        .map((order) => (
                          <tr key={order.orderId}>
                            {columnsVisibility.vendorAction && (
                              <td>
                                <select
                                  className="form-control form-control-sm"
                                  onChange={(e) => {
                                    if (e.target.value === "create-invoice") {
                                      handleCreateInvoice(order.id);
                                    }
                                    e.target.value = "";
                                  }}
                                >
                                  <option value="">Shipped</option>
                                  <option
                                    value="create-invoice"
                                    disabled={!!order.file} // ✅ disable if invoice already exists
                                  >
                                    {order.file
                                      ? "Invoice Created"
                                      : "Create Invoice"}
                                  </option>
                                </select>
                              </td>
                            )}
                            {columnsVisibility.orderDate && (
                              <td>{order.orderDate}</td>
                            )}
                            {columnsVisibility.orderId && (
                              <td>{order.purchaseOrderId}</td>
                            )}
                            {columnsVisibility.expectedDate && (
                              <td>{order.deliveryDate || "N/A"}</td>
                            )}
                            {columnsVisibility.referenceNumber && (
                              <td>{order.referenceNumber}</td>
                            )}
                            {/* {columnsVisibility.location && (
                              <td>{order.location}</td>
                            )} */}

                            {columnsVisibility.customer && (
                              <td>{order.customer || "Fuma"}</td>
                            )}
                            {columnsVisibility.totalItems && (
                              <td>{order.totalItems}</td>
                            )}
                            {columnsVisibility.updatedItems && (
                              <td>{order.totalShippedItems}</td>
                            )}
                            {columnsVisibility.additionalNotes && (
                              <td>{order.additionalNotes}</td>
                            )}
                            {columnsVisibility.orderedBy && (
                              <td>{order.addedBy}</td>
                            )}
                            {columnsVisibility.invoice && (
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
                                  >
                                    <i className="fas fa-download me-1"></i>{" "}
                                    Download
                                  </a>
                                ) : (
                                  "No Invoice"
                                )}
                              </td>
                            )}
                            {columnsVisibility.action && (
                              <td>
                                <button
                                  className="btn btn-edit btn-sm mr-2"
                                  onClick={printData}
                                >
                                  <i className="fas fa-edit"></i> Print
                                </button>
                                <button
                                  className="btn btn-view btn-sm mr-2"
                                  onClick={() => handleViewClick(order.id)}
                                >
                                  <i className="fas fa-eye"></i> View
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {/* Pagination info */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredOrders.length)} of{" "}
                      {filteredOrders.length} entries
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary mx-1"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary mx-1"
                        disabled={endIndex >= filteredOrders.length}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalesInvoices;
