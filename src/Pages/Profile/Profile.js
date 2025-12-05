import React, { useState, useEffect } from "react";
import "../Profile/Profile.css";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { BarChart } from "@mui/x-charts";
import { PieChart } from "@mui/x-charts/PieChart";
import Collapse from "react-bootstrap/Collapse";
import { Link, useNavigate } from "react-router-dom";

const Profile = ({ vendorFirmName }) => {
  const [columnsVisibility, setColumnsVisibility] = useState({
    status: true,
    action: true,
    orderDate: true,
    orderId: true,
    referenceNumber: true,
    location: true,
    customer: true,
    totalItems: true,
    additionalNotes: true,
    orderedBy: true,
  });
  const [allOrders, setAllOrders] = useState([]);
  const [date, setDate] = useState([]);
  const navigate = useNavigate();

  const [totalOrders, setTotalOrders] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGranularity, setSelectedGranularity] = useState("day");
  const [selectedMetric, setSelectedMetric] = useState("orders");
  const [chartData, setChartData] = useState({});
  const [totalOrderItems, setTotalOrderItems] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [acceptedOrders, setAcceptedOrders] = useState(0);
  const [shippedOrders, setShippedOrders] = useState(0);
  const [returnedOrders, setReturnedOrders] = useState(0);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getStatusCode = (status) => {
    switch (status) {
      case "Ordered":
        return 0;
      case "Accepted":
        return 1;
      case "Rejected":
        return 2;
      case "Shipped":
        return 3;
      case "Return":
        return 4;
      case "AcceptReturn":
        return 5;
      default:
        return -1;
    }
  };

  const [vendorLogo, setVendorLogo] = useState(
    "https://via.placeholder.com/100"
  );
  const [vendorData, setVendorData] = useState({});

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/getall`
        );
        const data = await response.json();
        const filteredVendor = data.find(
          (vendor) => vendor.firmName === vendorFirmName
        );
        console.log(filteredVendor);
        if (filteredVendor) {
          setVendorData(filteredVendor);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchVendorData();
  }, [vendorFirmName]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/getall`
        );
        console.log(data.response);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log(data);
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => b.id - a.id);
          setAllOrders(sortedData);

          // Calculate status counts
          const counts = {
            new: 0,
            accepted: 0,
            shipped: 0,
            returned: 0,
          };

          sortedData.forEach((order) => {
            if (order.vendor === vendorFirmName) {
              switch (order.status) {
                case 0:
                  counts.new++;
                  break;
                case 1:
                  counts.accepted++;
                  break;
                case 3:
                  counts.shipped++;
                  break;
                case 4:
                case 5:
                  counts.returned++;
                  break;
                default:
                  break;
              }
            }
          });

          setTotalOrders(
            sortedData.filter((order) => order.vendor === vendorFirmName).length
          );
          setNewOrders(counts.new);
          setAcceptedOrders(counts.accepted);
          setShippedOrders(counts.shipped);
          setReturnedOrders(counts.returned);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    };

    fetchPendingOrders();
  }, [vendorFirmName]);

  useEffect(() => {
    processData(selectedGranularity, selectedMetric);
  }, [allOrders, selectedGranularity, selectedMetric]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVendorLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportCSV = () => {
    const csvData = allOrders.map((order) => ({
      "Vendor Action": order.status,
      Action: order.action,
      "Order ID": order.orderId,
      "Reference Number": order.referenceNumber,
      Location: order.location,
      Customer: order.customerName,
      "Total Items": order.totalItems,
      "Additional Notes": order.additionalNotes,
      "Ordered By": order.orderedBy,
    }));

    const csv = [
      Object.keys(csvData[0]),
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "orders.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      allOrders.map((order) => ({
        "Vendor Action": order.status,
        Action: order.action,
        "Order ID": order.orderId,
        "Reference Number": order.referenceNumber,
        Location: order.location,
        Customer: order.customerName,
        "Total Items": order.totalItems,
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
      head: [Object.keys(allOrders[0])],
      body: allOrders.map((order) => Object.values(order)),
    });
    doc.save("orders.pdf");
  };

  const printData = () => {
    const printContent = document.getElementById("table-container").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>Print</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const toggleColumn = (column) => {
    setColumnsVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleGranularityChange = (e) => {
    setSelectedGranularity(e.target.value);
  };

  const handleMetricChange = (e) => {
    setSelectedMetric(e.target.value);
  };

  const processData = (granularity, metric) => {
    let processedData = {};
    const vendorOrders = allOrders.filter(
      (order) => order.vendor === vendorFirmName
    );

    vendorOrders.forEach((order) => {
      let key;
      const date = new Date(order.orderDate);

      if (granularity === "year") {
        key = date.getFullYear();
      } else if (granularity === "month") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else {
        key = date.toLocaleDateString();
      }

      if (!processedData[key]) processedData[key] = 0;

      if (metric === "orders") {
        processedData[key] += 1;
      } else {
        processedData[key] += order.totalItems || 0;
      }
    });

    setChartData(processedData);

    // Calculate totals
    const totals = {
      orders: vendorOrders.length,
      orderItems: vendorOrders.reduce(
        (sum, order) => sum + (order.totalItems || 0),
        0
      ),
    };

    setTotalOrders(totals.orders);
    setTotalOrderItems(totals.orderItems);
  };

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const filteredOrders = allOrders.filter((order) => {
    // Filter by vendor
    if (order.vendor !== vendorFirmName) return false;

    // Filter by status
    if (statusFilter && order.status !== getStatusCode(statusFilter))
      return false;

    // Filter by date range
    const orderDate = new Date(order.orderDate);
    if (startDate && orderDate < new Date(startDate)) return false;
    if (endDate && orderDate > new Date(endDate)) return false;

    return true;
  });

  const handleEdit = (id) => {
    navigate(`/EditVendorInfo/${id}`);
  };

  const getOrderStatusMessage = (status) => {
    switch (status) {
      case 0:
        return "Order placed but not yet completed";
      case 1:
        return "Order is being processed";
      case 3:
        return "Order completed";
      case 4:
      case 5:
        return "Order returned";
      default:
        return "Unknown status";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0:
        return "🕒";
      case 1:
        return "🔄";
      case 3:
        return "✅";
      case 4:
      case 5:
        return "↩️";
      default:
        return "❓";
    }
  };

  // Mock data for timeline and orders
  const ordersData = [
    {
      date: "2024-10-05",
      product: "Wireless Headphones",
      customer: "John Doe",
      status: 0,
    },
    {
      date: "2024-10-03",
      product: "Smartphone",
      customer: "Jane Smith",
      status: 1,
    },
    {
      date: "2024-10-01",
      product: "Laptop",
      customer: "Michael Johnson",
      status: 3,
    },
    {
      date: "2024-09-29",
      product: "Tablet",
      customer: "Emily Davis",
      status: 3,
    },
  ];

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <div className="vendor-panel-container row d-flex justify-content-evenly">
          {/* Vendor Profile Card */}
          <div className="col-12 card card-default rounded-4 border-0 cardHover">
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-4 d-flex align-items-center position-relative">
                  <div>
                    <label
                      htmlFor="upload-logo"
                      className="btn btn-primary position-absolute"
                      style={{
                        left: "80px",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        color: "white",
                        border: "none",
                        backgroundColor: "#007bff",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </label>
                    <img
                      src={vendorLogo}
                      alt="Vendor Logo"
                      className="vendor-logo rounded-circle me-3"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      id="upload-logo"
                    />
                  </div>
                  <div className="vendor-details">
                    <button
                      className="btn btn-view btn-sm mr-2 float-end"
                      onClick={() => handleEdit(vendorData.id)}
                    >
                      Edit
                    </button>
                    <h2>{vendorData.firmName}</h2>
                    <br />
                    <p>Email: {vendorData.email}</p>
                    <p>Location: {vendorData.address}</p>
                    <p>Phone Number: {vendorData.mobileNumber}</p>
                    <p>Vendor Type: {vendorData.vendorType}</p>
                    <p>GST no: {vendorData.taxOrGstNumber}</p>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>New Orders</h3>
                        <p>{newOrders}</p>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>Accepted Orders</h3>
                        <p>{acceptedOrders}</p>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>Shipped Orders</h3>
                        <p>{shippedOrders}</p>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>Return Orders</h3>
                        <p>{returnedOrders}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="col-lg-7 card card-default rounded-4 border-0 cardHover">
            <div
              className="card-body"
              style={{ position: "relative", width: "100%" }}
            >
              <div className="row mb-3">
                <div className="col-md-4">
                  <label>Choose time granularity:</label>
                  <select
                    className="form-control"
                    onChange={handleGranularityChange}
                    value={selectedGranularity}
                  >
                    <option value="year">Year</option>
                    <option value="month">Month</option>
                    <option value="day">Day</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label>Choose metric:</label>
                  <select
                    className="form-control"
                    onChange={handleMetricChange}
                    value={selectedMetric}
                  >
                    <option value="orders">Orders</option>
                    <option value="orderItems">Order Items</option>
                  </select>
                </div>
              </div>

              <BarChart
                series={[{ data: Object.values(chartData) }]}
                height={290}
                xAxis={[{ data: Object.keys(chartData), scaleType: "band" }]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                  zIndex: 1,
                }}
              >
                <div>
                  <strong>Total Orders:</strong> {totalOrders}
                </div>
                <div>
                  <strong>Total Order Items:</strong> {totalOrderItems}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-1"></div>
          <div className="col-lg-4 card card-default rounded-4 border-0 cardHover">
            <div className="card-body">
              <PieChart
                series={[
                  {
                    data: [
                      { id: 0, value: newOrders, label: "New Orders" },
                      { id: 1, value: acceptedOrders, label: "Accepted" },
                      { id: 2, value: shippedOrders, label: "Shipped" },
                      { id: 3, value: returnedOrders, label: "Returned" },
                    ],
                  },
                ]}
                width={400}
                height={200}
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="card card-default rounded-4 border-0 cardHover">
            <div className="mx-4 my-3">
              <a
                className="btn-icon-only btn-light p-3 mb-4 fw-bold bg-transparent filter_color"
                onClick={() => setOpen(!open)}
                aria-controls="example-collapse-text"
                aria-expanded={open}
                style={{ color: "#78b833", border: "none", cursor: "pointer" }}
              >
                <i className="fa fa-filter me-3"></i> Filter
              </a>
              <Collapse in={open}>
                <div id="example-collapse-text">
                  <hr />
                  <div className="card-body">
                    <div className="row py-2 g-2">
                      <div className="col-md-3">
                        <div className="dropdown">
                          <label className="me-2 d-md-inline">Status:</label>
                          <select
                            className="form-select me-2"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ cursor: "pointer" }}
                          >
                            <option value="">All</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Return">Return</option>
                            <option value="AcceptReturn">Accept Return</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="dropdown">
                          <label className="me-2 d-md-inline">
                            Start Date:
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={handleStartDateChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="dropdown">
                          <label className="me-2 d-md-inline">End Date:</label>
                          <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={handleEndDateChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>
          </div>

          {/* Orders Table */}
          <div className="col-12 card card-default rounded-4 border-0 cardHover">
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
                          <span className="btn border-0 bg-transparent p-0 m-0">
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
                      {columnsVisibility.status && <th>Status</th>}
                      {columnsVisibility.action && <th>Action</th>}
                      {columnsVisibility.orderDate && <th>Date</th>}
                      {columnsVisibility.orderId && <th>Order ID</th>}
                      {columnsVisibility.referenceNumber && (
                        <th>Reference Number</th>
                      )}
                      {columnsVisibility.location && <th>Location</th>}
                      {columnsVisibility.customer && <th>Customer</th>}
                      {columnsVisibility.totalItems && <th>Total Items</th>}
                      {columnsVisibility.additionalNotes && (
                        <th>Additional Notes</th>
                      )}
                      {columnsVisibility.orderedBy && <th>Ordered By</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(startIndex, endIndex).map((order) => (
                      <tr key={order.id}>
                        {columnsVisibility.status && (
                          <td>
                            {order.status === 0
                              ? "Ordered"
                              : order.status === 1
                              ? "Accepted"
                              : order.status === 2
                              ? "Rejected"
                              : order.status === 3
                              ? "Shipped"
                              : order.status === 4
                              ? "Return"
                              : order.status === 5
                              ? "Accepted Return"
                              : "Unknown Status"}
                          </td>
                        )}
                        {columnsVisibility.action && (
                          <td>
                            <button className="btn btn-sm btn-primary">
                              View
                            </button>
                          </td>
                        )}
                        {columnsVisibility.orderDate && (
                          <td>{order.orderDate}</td>
                        )}
                        {columnsVisibility.orderId && (
                          <td>{order.purchaseOrderId}</td>
                        )}
                        {columnsVisibility.referenceNumber && (
                          <td>{order.referenceNumber}</td>
                        )}
                        {columnsVisibility.location && (
                          <td>{order.location}</td>
                        )}
                        {columnsVisibility.customer && (
                          <td>{order.customer}</td>
                        )}
                        {columnsVisibility.totalItems && (
                          <td>{order.totalItems}</td>
                        )}
                        {columnsVisibility.additionalNotes && (
                          <td>{order.additionalNotes}</td>
                        )}
                        {columnsVisibility.orderedBy && (
                          <td>{order.addedBy}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Timeline and Recent Orders */}
          <div className="col-lg-8 card card-default rounded-4 border-0 cardHover timeline-div">
            <div className="card-body">
              <div className="timeline mb-4 border-0">
                <h3 className="timeline_tital">Recent Transactions</h3>
                <ul className="timeline-list">
                  {ordersData.map((order, index) => (
                    <li key={index} className="timeline-item">
                      <div className="timeline-icon">
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-date">
                          <strong>{order.date}</strong>
                        </div>
                        <div className="timeline-details">
                          <strong>{order.product}</strong> ordered by{" "}
                          {order.customer}
                          <span className={`status ${order.status}`}>
                            ({getOrderStatusMessage(order.status)})
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-3 card card-default rounded-4 border-0 cardHover timeline-div">
            <div className="card-body">
              <div className="orders mb-4 border-0">
                <h3>Current Orders</h3>
                <ul className="list-unstyled">
                  {ordersData.map((order, index) => (
                    <li key={index}>
                      <strong>{order.date}</strong> - {order.product} ordered by{" "}
                      {order.customer}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="col-lg-8 card card-default rounded-4 border-0 cardHover">
            <div className="card-body">
              <div className="financial-summary mb-4 border-0">
                <h3>Financial Summary</h3>
                <div className="row">
                  <div className="col-md-4">
                    <div className="metric-box bg-light p-3 text-center shadow-sm">
                      <h3>Revenue</h3>
                      <p>$50,000 (This Month)</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric-box bg-light p-3 text-center shadow-sm">
                      <h3>Expenses</h3>
                      <p>$10,000</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric-box bg-light p-3 text-center shadow-sm">
                      <h3>Profit Margin</h3>
                      <p>40%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
