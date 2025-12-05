import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css";
import "../../assets/plugins/datatables-responsive/css/responsive.bootstrap4.min.css";
import "../../assets/plugins/datatables-buttons/css/buttons.bootstrap4.min.css";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import $ from "jquery";
import { Collapse } from "react-bootstrap";

const ListWarrantyClaim = ({ vendorFirmName }) => {
  const navigate = useNavigate();

  const [ListWarrantyClaim, setListWarrantyClaim] = useState([]);
  const [filteredListWarrantyClaim, setFilteredListWarrantyClaim] = useState([]);
  const [columnsVisibility, setColumnsVisibility] = useState({
    action: true,
    date: true,
    referenceNo: true,
    location: true,
    status: true,
    totalAmount: true,
    reason: true,
    totalUnits: true,
  });

  const [modalType, setModalType] = useState(null);
  const [currentlistWarrantyClaim, setCurrentlistWarrantyClaim] =
    useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [formData, setFormData] = useState({
    date: "",
    referenceNo: "",
    location: "",
    status: "",
    totalAmount: "",
    reason: "",
    totalUnits: "",
  });
  
  // State variables for filters
  const [activeFilters, setActiveFilters] = useState({
    startDate: "",
    endDate: "",
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
      startDate: "",
      endDate: "",
    });
  };

  const fetchListWarrantyClaim = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/vendor-warranty-claim/getall`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
      if (Array.isArray(data)) {
        // Sort the data by 'id' in descending order
        const sortedData = data.sort((a, b) => b.id - a.id);
        setListWarrantyClaim(sortedData);
        setFilteredListWarrantyClaim(sortedData);
      } else {
        console.error("Fetched data is not an array");
        setListWarrantyClaim([]);
        setFilteredListWarrantyClaim([]);
      }
    } catch (error) {
      console.error("Error fetching ListWarrantyClaim:", error);
      setListWarrantyClaim([]);
      setFilteredListWarrantyClaim([]);
    }

    // Add external script directly without setTimeout
    const script = document.createElement("script");
    script.src = "js/JqueryContent.js";
    script.async = true;

    document.body.appendChild(script);

    // Cleanup function to remove the script element when the component is unmounted
    return () => {
      document.body.removeChild(script);
    };
  };

  useEffect(() => {
    fetchListWarrantyClaim();
  }, []);

  // Apply filters whenever activeFilters or ListWarrantyClaim changes
  useEffect(() => {
    const filteredData = ListWarrantyClaim.filter((claim) => {
      const claimDate = new Date(claim.date);
      
      // Check if claim belongs to the vendor
      if (claim.vendor !== vendorFirmName) {
        return false;
      }
      
      // Check date range filter
      if (activeFilters.startDate && activeFilters.endDate) {
        const startDate = new Date(activeFilters.startDate);
        const endDate = new Date(activeFilters.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        
        return claimDate >= startDate && claimDate <= endDate;
      } else if (activeFilters.startDate) {
        const startDate = new Date(activeFilters.startDate);
        return claimDate >= startDate;
      } else if (activeFilters.endDate) {
        const endDate = new Date(activeFilters.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        return claimDate <= endDate;
      }
      
      return true;
    });
    
    setFilteredListWarrantyClaim(filteredData);
  }, [activeFilters, ListWarrantyClaim, vendorFirmName]);

  const exportCSV = () => {
    const csvData = filteredListWarrantyClaim.map((listWarrantyClaim) => ({
      Action: listWarrantyClaim.action,
      Date: listWarrantyClaim.date,
      ReferenceNo: listWarrantyClaim.referenceNo,
      Location: listWarrantyClaim.location,
      status: listWarrantyClaim.status,
      TotalAmount: listWarrantyClaim.totalAmount,
      Reason: listWarrantyClaim.reason,
      totalUnits: listWarrantyClaim.totalUnits,
    }));

    const csv = [
      [
        "Action",
        "Date",
        "Reference No",
        "Location",
        "Status",
        "Total Amount",
        "Total Amount Recovered",
        "Reason",
        "Added By",
      ],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "ListWarrantyClaim.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredListWarrantyClaim.map((listWarrantyClaim) => ({
        Action: listWarrantyClaim.action,
        Date: listWarrantyClaim.date,
        ReferenceNo: listWarrantyClaim.referenceNo,
        Location: listWarrantyClaim.location,
        status: listWarrantyClaim.status,
        TotalAmount: listWarrantyClaim.totalAmount,
        Reason: listWarrantyClaim.reason,
        totalUnits: listWarrantyClaim.totalUnits,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ListWarrantyClaim");
    XLSX.writeFile(wb, "ListWarrantyClaim.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Define the column headers
    const headers = [
      "Action",
      "Date",
      "Reference No",
      "Location",
      "Status",
      "Total Amount",
      "Total Amount Recovered",
      "Reason",
      "Added By",
    ];

    // Map through the stock adjustment data and prepare the body
    const body = filteredListWarrantyClaim.slice(startIndex, endIndex).map(
      (adjustment) => [
        "", // Placeholder for action buttons
        adjustment.date,
        adjustment.referenceNo,
        adjustment.location,
        adjustment.status,
        adjustment.totalAmount,
        adjustment.reason,
        adjustment.totalUnits,
      ]
    );

    // Add some space before the table
    doc.text("Stock Adjustment List", 14, 20); // Title with a slight offset
    doc.setFontSize(12);
    doc.text(
      "Below is the list of stock adjustments with their details:",
      14,
      30
    );

    // Generate the PDF table with custom styles
    doc.autoTable({
      head: [headers],
      body: body,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [22, 160, 133], // Bootstrap success color
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray for alternate rows
      },
      margin: { top: 50 }, // Increase top margin for more space above the table
    });

    // Save the PDF
    doc.save("StockAdjustmentList.pdf");
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const printData = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    const tableContent = `
      <html>
        <head>
          <title>Print Stock Adjustments</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            th, td { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Stock Adjustments Report</h2>
          <table>
            <thead>
              <tr>
                ${columnsVisibility.date ? "<th>Date</th>" : ""}
                ${columnsVisibility.referenceNo ? "<th>Reference No</th>" : ""}
                ${columnsVisibility.location ? "<th>Location</th>" : ""}
                ${columnsVisibility.status ? "<th>Status</th>" : ""}
                ${columnsVisibility.totalAmount ? "<th>Total Amount</th>" : ""}
               
                ${columnsVisibility.reason ? "<th>Reason</th>" : ""}
                ${columnsVisibility.totalUnits ? "<th>Added By</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${filteredListWarrantyClaim.slice(startIndex, endIndex)
                .map(
                  (listWarrantyClaim) => `
                    <tr>
                    
                      ${
                        columnsVisibility.date
                          ? `<td>${listWarrantyClaim.date}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.referenceNo
                          ? `<td>${listWarrantyClaim.referenceNo}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.location
                          ? `<td>${listWarrantyClaim.businessLocation}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.status
                          ? `<td>${listWarrantyClaim.status}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalAmount
                          ? `<td>${listWarrantyClaim.totalAmount}</td>`
                          : ""
                      }
                      
                      ${
                        columnsVisibility.reason
                          ? `<td>${listWarrantyClaim.reason}</td>`
                          : ""
                      }
                      ${
                        columnsVisibility.totalUnits
                          ? `<td>${listWarrantyClaim.totalUnits}</td>`
                          : ""
                      }
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
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

  const handleEdit = (id) => {
    const listWarrantyClaimToEdit = filteredListWarrantyClaim.find(
      (listWarrantyClaim) => listWarrantyClaim.id === id
    );
    if (listWarrantyClaimToEdit) {
      setCurrentlistWarrantyClaim(listWarrantyClaimToEdit);
      setFormData({
        date: listWarrantyClaimToEdit.date,
        referenceNo: listWarrantyClaimToEdit.referenceNo,
        location: listWarrantyClaimToEdit.location,
        status: listWarrantyClaimToEdit.status,
        totalAmount: listWarrantyClaimToEdit.totalAmount,
        reason: listWarrantyClaimToEdit.reason,
        totalUnits: listWarrantyClaimToEdit.totalUnits,
      });
      setModalType("edit");
    }
  };
  const handleViewClick = (id) => {
    navigate(`/ViewWarrantyClaim/${id}`);
  };

  function handleActionChange(event, id) {
    const selectedAction = event.target.value;

    let status = 0;
    let actionMessage = "";

    if (selectedAction === "accept") {
      status = 1; // Status 1 for Accept
      actionMessage = "Accept";
    } else if (selectedAction === "reject") {
      status = 2; // Status 2 for Reject
      actionMessage = "Reject";
    } else if (selectedAction === "replaced") {
      // If action is "ship", just navigate to the shipwarranty page without calling the API
      const confirmAction = window.confirm(
        `Are you sure you want to ship this warranty claim?`
      );

      if (confirmAction) {
        navigate(`/ReplaceWarranty/${id}`);
      } else {
        // If user canceled the action, reset the dropdown (optional)
        event.target.value = "";
      }
      return; // Return here to avoid proceeding with the API call
    }

    // Proceed with the API call if action is not "ship"
    if (status !== 0) {
      const confirmAction = window.confirm(
        `Are you sure you want to ${actionMessage} this warranty claim?`
      );

      if (confirmAction) {
        fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor-warranty-claim/updateStatus/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(status),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            console.log(`${actionMessage}ed warranty claim:`, data);
            alert(`${actionMessage}ed successfully!`);
            fetchListWarrantyClaim();
          })
          .catch((error) => {
            console.error("Error updating warranty claim:", error);
          });
      } else {
        // If user canceled the action, reset the dropdown (optional)
        event.target.value = "";
      }
    }
  }

  function getStatusValue(status) {
    if (status === 0) {
      return "pending"; // Default "Pending" for status 0
    } else if (status === 1) {
      return "accept"; // "Accept" for status 1
    } else if (status === 2) {
      return "reject"; // "Reject" for status 2
    } else if (status === 3) {
      return "replaced"; // "Reject" for status 2
    } else {
      return ""; // In case of an undefined status, return an empty string
    }
  }

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-12 col-md-6">
                <h1 className="all-heading">List Warranty Claim</h1>
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
                      {/* Start Date Picker */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="me-2">Start Date:</label>
                          <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={activeFilters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>

                      {/* End Date Picker */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="me-2">End Date:</label>
                          <input
                            type="date"
                            className="form-control"
                            name="endDate"
                            value={activeFilters.endDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>

                      {/* Reset Button */}
                      <div className="col-md-4 d-flex align-items-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetFilters();
                          }}
                          disabled={!Object.values(activeFilters).some(Boolean)}
                        >
                          <i className="fa fa-times me-1"></i> Reset All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>

            <div className="card cardHover rounded-4 border-0">
              <div className="d-flex justify-content-end mb-3">
                <Link to="/AddWarrantyClaim" className="btn btn-add">
                  <i className="fas fa-plus"></i> Add
                </Link>
              </div>

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
                        className="dropdown-menu pointer-event"
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
                            {col.replace(/([A-Z])/g, " $1").toUpperCase()}
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
                        {columnsVisibility.action && <th>Action</th>}
                        {columnsVisibility.action && <th>View</th>}
                        {columnsVisibility.status && <th>Status</th>}
                        {columnsVisibility.date && <th>Date</th>}
                        {columnsVisibility.referenceNo && <th>Reference No</th>}
                        {columnsVisibility.location && <th>Location</th>}
                        {columnsVisibility.totalAmount && <th>Total Amount</th>}

                        {columnsVisibility.reason && <th>Reason</th>}
                        {columnsVisibility.totalUnits && <th>Total Units</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListWarrantyClaim
                        .slice(startIndex, endIndex)
                        .map((listWarrantyClaim) => (
                          <tr key={listWarrantyClaim.id}>
                            {columnsVisibility.action && (
                              <td>
                                <select
                                  className="form-control form-control-sm"
                                  onChange={(event) =>
                                    handleActionChange(
                                      event,
                                      listWarrantyClaim.id
                                    )
                                  }
                                  value={getStatusValue(
                                    listWarrantyClaim.status
                                  )} // Set value dynamically
                                  disabled={listWarrantyClaim.status === 3} // Disable dropdown if status is "Shipped"
                                >
                                  {listWarrantyClaim.status === 0 && (
                                    <>
                                      <option value="pending" disabled selected>
                                        Pending
                                      </option>
                                      <option value="accept">Accept</option>
                                      <option value="reject">Reject</option>
                                      <option value="replaced">Replace</option>
                                    </>
                                  )}

                                  {listWarrantyClaim.status === 1 && (
                                    <>
                                      <option value="accept" disabled selected>
                                        Accepted
                                      </option>
                                      <option value="replaced">
                                        Ship Order
                                      </option>
                                    </>
                                  )}

                                  {listWarrantyClaim.status === 2 && (
                                    <>
                                      <option value="reject" disabled selected>
                                        Rejected
                                      </option>
                                      <option value="accept">Accept</option>
                                    </>
                                  )}

                                  {listWarrantyClaim.status === 3 && (
                                    <option value="replaced" disabled selected>
                                      Replaced
                                    </option>
                                  )}
                                </select>
                              </td>
                            )}

                            {columnsVisibility.action &&
                              listWarrantyClaim.status !== 4 && (
                                <td>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() =>
                                      handleViewClick(listWarrantyClaim.id)
                                    } // Opens the view modal
                                  >
                                    View
                                  </button>
                                </td>
                              )}

                            {columnsVisibility.status && (
                              <td>
                                {listWarrantyClaim.status === 0
                                  ? "Pending"
                                  : listWarrantyClaim.status === 1
                                  ? "Accepted"
                                  : listWarrantyClaim.status === 2
                                  ? "Rejected"
                                  : listWarrantyClaim.status === 3
                                  ? "Shipped"
                                  : "Unknown"}
                              </td>
                            )}

                            {columnsVisibility.date && (
                              <td>{listWarrantyClaim.date}</td>
                            )}
                            {columnsVisibility.referenceNo && (
                              <td>{listWarrantyClaim.referenceNumber}</td>
                            )}
                            {columnsVisibility.location && (
                              <td>{listWarrantyClaim.businessLocation}</td>
                            )}
                            {columnsVisibility.totalAmount && (
                              <td>{listWarrantyClaim.totalAmount}</td>
                            )}
                            {columnsVisibility.reason && (
                              <td>{listWarrantyClaim.reason}</td>
                            )}
                            {columnsVisibility.totalUnits && (
                              <td>{listWarrantyClaim.totalUnits}</td>
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
      </div>
    </div>
  );
};

export default ListWarrantyClaim;