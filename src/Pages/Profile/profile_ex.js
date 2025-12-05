import React, { useState, useEffect } from "react";
import "../Profile/Profile.css";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import $ from "jquery";
import { BarChart } from "@mui/x-charts";
import { PieChart } from "@mui/x-charts/PieChart";
import Collapse from "react-bootstrap/Collapse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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


  const [totalOrders, setTotalOrders] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGranularity, setSelectedGranularity] = useState("day"); // Year by default
  const [selectedMetric, setSelectedMetric] = useState("orders"); // Orders by default
  const [chartData, setChartData] = useState([]);
  const [totalOrderItems, setTotalOrderItems] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [acceptedOrders, setAcceptedOrders] = useState(0);
  const [shippedOrders, setShippedOrders] = useState(0);
  const [returnedOrders, setReturnedOrders] = useState(0);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(""); // Status filter state
  const [startDate, setStartDate] = useState(""); // Start date filter state
  const [endDate, setEndDate] = useState(""); // End date filter state
  const getStatusCode = (status) => {
    // You can define whatever logic you need to get the status code
    switch (status) {
      case 'new':
        return 0;
      case 'accepted':
        return 1;
      case 'shipped':
        return 3;
      case 'returned':
        return 4;
      default:
        return -1; // Default case for unknown statuses
    }
  };
  
  
  // State for managing the vendor logo image
  const [vendorLogo, setVendorLogo] = useState(
    "https://via.placeholder.com/100"
  );

  const [vendorData, setVendorData] = useState({});

  // Fetch vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await fetch("http://localhost:8080/vendor/getall"); // Replace with your API endpoint
        const data = await response.json();

        // Filter the data to include only the vendor with matching firmName
        const filteredVendor = data.find(
          (vendor) => vendor.firmName === vendorFirmName
        );

        if (filteredVendor) {
          setVendorData(filteredVendor); // Set the filtered vendor data
        } else {
          console.log("No vendor found with the given firmName.");
        }

        console.log(filteredVendor);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }

    };



    fetchVendorData();
  }, [vendorFirmName]); // The effect will re-run if vendorFirmName changes

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/purchaseorder/getall"
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        // Check if the fetched data is an array and sort by purchaseOrderId in descending order
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => b.id - a.id);
          setAllOrders(sortedData);

          // Calculate the total number of orders based on 'id' field
          const totalOrdersCount = sortedData.length;

          // Initialize counters for each status
          let newOrdersCount = 0;
          let acceptedOrdersCount = 0;
          let shippedOrdersCount = 0;
          let returnedOrdersCount = 0;

          // Loop through orders and count them based on status
          sortedData.forEach((order) => {
            switch (order.status) {
              case 0:
                newOrdersCount++;
                break;
              case 1:
                acceptedOrdersCount++;
                break;
              case 3:
                shippedOrdersCount++;
                break;
              case 4:
              case 5: // Combine status 4 and 5 as returned orders
                returnedOrdersCount++;
                break;
              default:
                break;
            }
          });

          console.log("New Orders (status 0):", newOrdersCount);
          console.log(
            "Accepted Orders (status 1):",
            acceptedOrdersCount
          );
          console.log("Shipped Orders (status 3):", shippedOrdersCount);
          console.log(
            "Returned Orders (status 4 or 5):",
            returnedOrdersCount
          );

          // Set the count for each status in state or display it as needed
          setTotalOrders(totalOrdersCount);
          setNewOrders(newOrdersCount);
          setAcceptedOrders(acceptedOrdersCount);
          setShippedOrders(shippedOrdersCount);
          setReturnedOrders(returnedOrdersCount);
        } else {
          console.error("Fetched data is not an array");
          setAllOrders([]);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setAllOrders([]);
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

    fetchPendingOrders();
  }, []);

  useEffect(() => {
    // This effect will run once when the component mounts
    processData(selectedGranularity, selectedMetric); // Ensure this is called to process the data with default settings
  }, []);

  // Mock data for each section
  const orders = [
    {
      date: "2024-10-05",
      product: "Wireless Headphones",
      customer: "John Doe",
      status: "pending",
    },
    {
      date: "2024-10-03",
      product: "Smartphone",
      customer: "Jane Smith",
      status: "processing",
    },
    {
      date: "2024-10-01",
      product: "Laptop",
      customer: "Michael Johnson",
      status: "completed",
    },
    {
      date: "2024-09-29",
      product: "Tablet",
      customer: "Emily Davis",
      status: "completed",
    },
  ];

  const inventory = [
    { product: "Aspirin", stock: "50", price: "$20", status: "Low Stock" },
    { product: "Ibuprofen", stock: "200", price: "$10", status: "In Stock" },
  ];

  // Helper function to display custom status messages
  const getOrderStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "Order placed but not yet completed";
      case "processing":
        return "Order is being processed";
      case "completed":
        return "Order completed";
      default:
        return "Unknown status";
    }
  };

  // Helper function to determine the color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "processing":
        return "blue";
      case "completed":
        return "green";
      default:
        return "black";
    }
  };

  // Define the getStatusIcon function before your return statement
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "🕒"; // Pending icon (e.g., clock or pending symbol)
      case "processing":
        return "🔄"; // Processing icon (e.g., rotating arrows)
      case "completed":
        return "✅"; // Completed icon (e.g., checkmark)
      default:
        return "❓"; // Unknown status icon
    }
  };

  // Function to handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVendorLogo(reader.result); // Set the image as the vendor logo
      };
      reader.readAsDataURL(file); // Read the file as a data URL
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
      [
        "Vendor Action",
        "Action",
        "Order ID",
        "Reference Number",
        "Location",
        "Customer",
        "Total Items",
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
      head: [
        [
          "Vendor Action",
          "Action",
          "Order ID",
          "Reference Number",
          "Location",
          "Customer",
          "Total Items",
          "Additional Notes",
          "Ordered By",
        ],
      ],
      body: allOrders.map((order) => [
        order.status,
        order.action,
        order.orderId,
        order.referenceNumber,
        order.location,
        order.customerName,
        order.totalItems,
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

  const startIndex = (currentPage - 1) * entriesPerPage;

  const endIndex = startIndex + entriesPerPage;

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when entries per page changes
  };

  const handleDropdownItemClick = (col, e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and affecting the dropdown toggle
    toggleColumn(col); // Toggle column visibility
  };

  // Assuming allOrders is an array of order objects
  const aggregatedData = {
    2021: 0,
    2022: 0,
    2023: 0,
    2024: 0,
  };

  allOrders
    .filter((order) => order.vendor === vendorFirmName) // Filter by vendor
    .forEach((order) => {
      const orderYear = new Date(order.orderDate).getFullYear();

      // Count the orders by year
      if (aggregatedData[orderYear] !== undefined) {
        aggregatedData[orderYear] += order.totalItems; // Example: summing total items per year
      }
    });

  const handleGranularityChange = (e) => {
    setSelectedGranularity(e.target.value);
    processData(e.target.value, selectedMetric);
  };

  const handleMetricChange = (e) => {
    setSelectedMetric(e.target.value);
    processData(selectedGranularity, e.target.value);
  };

  const processData = (granularity, metric) => {
    // Process the data based on selected granularity and metric
    let processedData = [];
  
    if (granularity === "year") {
      processedData = groupByYear(allOrders, metric);
    } else if (granularity === "month") {
      processedData = groupByMonth(allOrders, metric);
    } else if (granularity === "day") {
      processedData = groupByDay(allOrders, metric);
    }
  
    // Calculate totals based on the selected metric
    const { totalOrders, totalOrderItems } = calculateTotals(allOrders, metric);
  
    setTotalOrders(totalOrders);
    setTotalOrderItems(totalOrderItems);
    setChartData(processedData); // Ensure chartData is updated with the processed data
  };
  
  // Mock data processing functions
  const groupByYear = (orders, metric) => {
    let groupedData = {};
    orders.forEach((order) => {
      const year = new Date(order.orderDate).getFullYear();
      if (!groupedData[year]) groupedData[year] = 0;
  
      if (metric === "orders") {
        groupedData[year] += 1; // Increment for each order
      } else if (metric === "orderItems") {
        groupedData[year] += order.totalItems; // Sum of items for each order
      }
    });
    return groupedData;
  };
  
  const groupByMonth = (orders, metric) => {
    let groupedData = {};
    orders.forEach((order) => {
      const yearMonth = `${new Date(order.orderDate).getFullYear()}-${
        new Date(order.orderDate).getMonth() + 1
      }`;
      if (!groupedData[yearMonth]) groupedData[yearMonth] = 0;
  
      if (metric === "orders") {
        groupedData[yearMonth] += 1; // Increment for each order
      } else if (metric === "orderItems") {
        groupedData[yearMonth] += order.totalItems; // Sum of items for each order
      }
    });
    return groupedData;
  };
  
  const groupByDay = (orders, metric) => {
    let groupedData = {};
    orders.forEach((order) => {
      const day = new Date(order.orderDate).toLocaleDateString();
      if (!groupedData[day]) groupedData[day] = 0;
  
      if (metric === "orders") {
        groupedData[day] += 1; // Increment for each order
      } else if (metric === "orderItems") {
        groupedData[day] += order.totalItems; // Sum of items for each order
      }
    });
    return groupedData;
  };
  
  const calculateTotals = (orders, metric) => {
    let totalOrders = 0;
    let totalOrderItems = 0;
  
    orders.forEach((order) => {
      if (metric === "orders") {
        totalOrders += 1; // Count orders
      } else if (metric === "orderItems") {
        totalOrderItems += order.totalItems; // Sum of items
      }
    });

    
  
    return { totalOrders, totalOrderItems };
  };



  // Handle start and end date changes
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  // Filter logic based on status and date range
  const filteredOrders = allOrders.filter((order) => {
    if (status && order.status !== status) {
      return false;
    }
    if (startDate && new Date(order.date) < new Date(startDate)) {
      return false;
    }
    if (endDate && new Date(order.date) > new Date(endDate)) {
      return false;
    }
    return true;
  });

  const handleEdit = (id) => {
    navigate(`/EditVendorInfo/${id}`); // Navigate to the edit page with the vendor ID
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <div className="vendor-panel-container row d-flex  justify-content-evenly  ">
          <div className=" col-12  card card-default rounded-4 border-0 cardHover ">
            <div className="card-body">
              {/* Overview Section */}
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
                        border: "none", // Remove border for a cleaner look
                        backgroundColor: "#007bff", // Bootstrap primary color
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
                      style={{ display: "none" }} // Hide the file input
                      id="upload-logo"
                    />
                  </div>
                  <div className="vendor-details">
                    <button className="btn btn-view btn-sm mr-2 float-end "   onClick={() => handleEdit(vendorData.id)} >Edit</button>
                    <h2> {vendorData.firmName} </h2>
                    <br />
                    <p> Email: {vendorData.email} </p>
                    <p>Location: {vendorData.address} </p>
                    <p>phone Number: {vendorData.mobileNumber} </p>
                    <p>Vendor Type: {vendorData.vendorType} </p>
                    <p>GST no: {vendorData.taxOrGstNumber} </p>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>new Orders</h3>
                        <p> {newOrders} </p>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>Accepted Orders</h3>
                        <p> {acceptedOrders} </p>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>Shipped Orders Stock</h3>
                        <p> {shippedOrders} </p>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div
                        className="metric-box bg-light p-3 text-center shadow-sm"
                        style={{ height: "150px" }}
                      >
                        <h3>Return Orders</h3>
                        <p> {returnedOrders} </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7 card card-default rounded-4 border-0 cardHover">
            <div
              className="card-body "
              style={{ position: "relative", width: "100%" }}
            >
              <div>
                <label>Choose time granularity:</label>
                <select
                  onChange={handleGranularityChange}
                  value={selectedGranularity}
                >
                  <option value="year">Year</option>
                  <option value="month">Month</option>
                  <option value="day">Day</option>
                </select>
              </div>

              <div>
                <label>Choose metric:</label>
                <select onChange={handleMetricChange} value={selectedMetric}>
                  <option value="orders">Orders</option>
                  <option value="orderItems">Order Items</option>
                </select>
              </div>

              <BarChart
                series={[
                  {
                    data: Object.values(chartData), // Array of either order counts or total order items
                  },
                ]}
                height={290}
                xAxis={[{ data: Object.keys(chartData), scaleType: "band" }]} // Time periods (year, month, day)
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background for readability
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
                      { id: 0, value: 10, label: "series A" },
                      { id: 1, value: 15, label: "series B" },
                      { id: 2, value: 20, label: "series C" },
                    ],
                  },
                ]}
                width={400}
                height={200}
              />
            </div>
          </div>
          
          {/* filler start  */}
          <div className="card card-default rounded-4 border-0 cardHover">
      <div className="mx-4 my-3">
        <a
          className="btn-icon-only btn-light p-3 mb-4 fw-bold bg-transparent filter_color"
          onClick={() => setOpen(!open)}
          aria-controls="example-collapse-text"
          aria-expanded={open}
          style={{
            color: "#78b833",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.Color = "#78b833";
          }}
          onMouseOut={(e) => {
            e.target.style.Color = "#78b833";
          }}
        >
          <i className="fa fa-filter me-3"></i> Filter
        </a>
        <Collapse in={open}>
          <div id="example-collapse-text">
            <hr />
            <div className="card-body">
              <div className="row py-2 g-2">
                {/* Status Filter */}
                <div className="col-md-3">
                  <div className="dropdown">
                    <label className="me-2 d-md-inline">Status:</label>
                    <select
                      className="form-select me-2"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
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

                {/* Date Range Filters */}
                <div className="col-md-3">
                  <div className="dropdown">
                    <label className="me-2 d-md-inline">Start Date:</label>
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
            {/* filter end  */}


          <div className="col-12 card card-default rounded-4 border-0 cardHover">
            <div className="card-body">
              {/* Inventory Section */}
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
                            onChange={() => toggleColumn(col)} // Toggle column visibility on checkbox change
                            className="mr-2"
                          />
                          <span
                            className="btn border-0 bg-transparent p-0 m-0"
                            onClick={(e) => handleDropdownItemClick(col, e)} // Handle click on dropdown item
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
                      {columnsVisibility.status && (
                        <th>Status&nbsp;&nbsp;&nbsp;&nbsp;</th>
                      )}
                      {columnsVisibility.action && <th>Action</th>}
                      {columnsVisibility.orderDate && (
                        <th>
                          &nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </th>
                      )}
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
  {allOrders
    .filter((order) => {
      // Filter by vendor
      const isVendorMatch = order.vendor === vendorFirmName;
      
      // Filter by status
      const isStatusMatch = status ? order.status === getStatusCode(status) : true;
      
      // Filter by start date and end date
      const orderDate = new Date(order.orderDate);
      const isStartDateMatch = startDate ? orderDate >= new Date(startDate) : true;
      const isEndDateMatch = endDate ? orderDate <= new Date(endDate) : true;
      
      return isVendorMatch && isStatusMatch && isStartDateMatch && isEndDateMatch;
    })
    .slice(startIndex, endIndex)
    .map((order) => (
      <tr key={order.orderId}>
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
            <button
              // Opens the view modal
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

          <div className="col-lg-8 card card-default rounded-4 border-0 cardHover timeline-div  ">
            <div className="card-body">
              {/* Timeline Section */}
              <div className="timeline mb-4 border-0">
                <h3 className=" timeline_tital">Recent Transactions</h3>
                <ul className="timeline-list">
                  {orders.map((order, index) => (
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

          <div className="col-lg-3 card card-default rounded-4 border-0 cardHover  timeline-div  ">
            <div className="card-body">
              {/* Orders Section */}
              <div className="orders mb-4 border-0">
                <h3>Current Orders</h3>
                <ul className="list-unstyled">
                  {orders.map((order, index) => (
                    <li key={index}>
                      <strong>{order.date}</strong> - {order.product} ordered by{" "}
                      {order.customer}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-8 card card-default rounded-4 border-0 cardHover">
            <div className="card-body">
              {/* Financial Summary */}
              <div className="financial-summary mb-4 border-0">
                <h3>Financial Summary</h3>
                <div className="row">
                  <div className="col-md-4">
                    <div className="metric-box bg-light p-3 text-center  shadow-sm ">
                      <h3>Revenue</h3>
                      <p>$50,000 (This Month)</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric-box bg-light p-3 text-center  shadow-sm ">
                      <h3>Expenses</h3>
                      <p>$10,000</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric-box bg-light p-3 text-center  shadow-sm ">
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
