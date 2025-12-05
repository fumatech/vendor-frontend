import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [vendorFirmName, setVendorFirmName] = useState("");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [acceptedOrdersCount, setAcceptedOrdersCount] = useState(0);
  const [shippedOrdersCount, setShippedOrdersCount] = useState(0);
  const [returnedOrdersCount, setReturnedOrdersCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const navigate = useNavigate();
  const pieChart1Ref = useRef(null);
  const pieChart2Ref = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    const firmName = sessionStorage.getItem("vendorFirmName");
    if (email) {
      setUserEmail(email);
    }
    if (firmName) {
      setVendorFirmName(firmName);
    }
  }, []);

  useEffect(() => {
    const fetchNewOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/getPendingOrders`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        if (Array.isArray(data)) {
          const vendorOrders = data.filter(order => order.vendor === vendorFirmName);
          setNewOrdersCount(vendorOrders.length);
        }
      } catch (error) {
        console.error("Error fetching new orders:", error);
      }
    };

    const fetchAcceptedOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/getAcceptedOrders`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        if (Array.isArray(data)) {
          const vendorOrders = data.filter(order => order.vendor === vendorFirmName);
          setAcceptedOrdersCount(vendorOrders.length);
        }
      } catch (error) {
        console.error("Error fetching accepted orders:", error);
      }
    };

    const fetchShippedOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/getShipOrders`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log(data);
        if (Array.isArray(data)) {
          const vendorOrders = data.filter(order => order.vendor === vendorFirmName);
          setShippedOrdersCount(vendorOrders.length);
        }
      } catch (error) {
        console.error("Error fetching shipped orders:", error);
      }
    };

    const fetchReturnOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchase-return/getPendingOrders`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log(data);
        if (Array.isArray(data)) {
          const vendorOrders = data.filter(order => order.vendor === vendorFirmName);
          setReturnedOrdersCount(vendorOrders.length);
          setReturnOrders(data.sort((a, b) => b.id - a.id));
        }
      } catch (error) {
        console.error("Error fetching return orders:", error);
      }
    };

    const fetchAllOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/getall`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        if (Array.isArray(data)) {
          const vendorOrders = data.filter(order => order.vendor === vendorFirmName);
          setTotalOrders(vendorOrders.length);
          setPurchases(data.sort((a, b) => b.id - a.id));
        }
      } catch (error) {
        console.error("Error fetching all orders:", error);
      }
    };

    if (vendorFirmName) {
      fetchNewOrders();
      fetchAcceptedOrders();
      fetchShippedOrders();
      fetchReturnOrders();
      fetchAllOrders();
    }
  }, [vendorFirmName]);

  useEffect(() => {
    if (pieChart1Ref.current && pieChart2Ref.current) {
      drawPieChart(
        pieChart1Ref.current,
        [newOrdersCount, acceptedOrdersCount, shippedOrdersCount, returnedOrdersCount],
        ["#FF5722", "#2196F3", "#4CAF50", "#9C27B0"]
      );
      
      drawPieChart(
        pieChart2Ref.current,
        [
          newOrdersCount,
          acceptedOrdersCount,
          shippedOrdersCount,
          returnedOrdersCount,
          totalOrders - newOrdersCount - acceptedOrdersCount - shippedOrdersCount - returnedOrdersCount
        ],
        ["#FF5722", "#2196F3", "#4CAF50", "#9C27B0", "#607D8B"]
      );
    }

    if (barChartRef.current && purchases.length > 0) {
      drawBarChart(barChartRef.current);
    }
  }, [newOrdersCount, acceptedOrdersCount, shippedOrdersCount, returnedOrdersCount, totalOrders, purchases]);

  const drawPieChart = (canvas, data, colors) => {
    const ctx = canvas.getContext("2d");
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) return;
    
    let startAngle = 0;
    const radius = Math.min(canvas.width, canvas.height) / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach((value, i) => {
      if (value > 0) {
        const sliceAngle = (2 * Math.PI * value) / total;
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      }
    });

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${total}`, centerX, centerY - 10);
    ctx.font = "12px Arial";
    ctx.fillText("Total", centerX, centerY + 10);
  };

  const drawBarChart = (canvas) => {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const margin = 30;
    
    const vendorPurchases = purchases.filter(p => p.vendor === vendorFirmName);
    const maxValue = Math.max(...vendorPurchases.map(p => p.totalItems || 0), 1);
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.strokeStyle = "#2c3e50";
    ctx.stroke();
    
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = height - margin - (i * (height - 2 * margin) / gridLines);
      
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.strokeStyle = "#eee";
      ctx.stroke();
      
      ctx.fillStyle = "#7f8c8d";
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(maxValue * i / gridLines).toString(), margin - 5, y + 4);
    }
    
    const barWidth = (width - 2 * margin) / Math.min(vendorPurchases.length, 6) - 10;
    vendorPurchases.slice(0, 6).forEach((purchase, i) => {
      const x = margin + 10 + i * (barWidth + 10);
      const barHeight = ((purchase.totalItems || 0) / maxValue) * (height - 2 * margin);
      const y = height - margin - barHeight;
      
      ctx.fillStyle = getStatusColor(purchase.status);
      ctx.fillRect(x, y, barWidth, barHeight);
      
      ctx.fillStyle = "#2c3e50";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(purchase.purchaseOrderId || `PO${purchase.id}`, x + barWidth/2, height - margin + 15);
      
      ctx.fillStyle = "#2c3e50";
      ctx.fillText(purchase.totalItems || "0", x + barWidth/2, y - 5);
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 0: return "#FF5722";
      case 1: return "#2196F3";
      case 3: return "#4CAF50";
      case 4: 
      case 5: return "#9C27B0";
      default: return "#e0e0e0";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 0: return "New";
      case 1: return "Accepted";
      case 2: return "Processing";
      case 3: return "Shipped";
      case 4: return "Delivered";
      case 5: return "Returned";
      default: return "Unknown";
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="content-wrapper" style={{ backgroundColor: "transparent" }}>
        <div className="content-header" style={{ padding: "15px" }}>
          <div className="container-fluid" style={{ padding: 0 }}>
            <div className="row mb-2">
              <div className="col-sm-6">
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "600", color: "#2c3e50" }}>
                  Vendor Dashboard
                </h2>
                <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#7f8c8d" }}>
                  Welcome, {vendorFirmName || userEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="content" style={{ padding: "0 15px" }}>
          <div className="container-fluid" style={{ padding: 0 }}>
            <div className="row" style={{ marginBottom: "20px" }}>
              {[
                {
                  count: newOrdersCount,
                  label: "New Orders",
                  color: "#FF5722",
                  path: "/Purchase?status=0",
                },
                {
                  count: acceptedOrdersCount,
                  label: "Accepted Orders",
                  color: "#2196F3",
                  path: "/Purchase?status=1",
                },
                {
                  count: shippedOrdersCount,
                  label: "Shipped Orders",
                  color: "#4CAF50",
                  path: "/Purchase?status=3",
                },
                {
                  count: returnedOrdersCount,
                  label: "Returned Orders",
                  color: "#9C27B0",
                  path: "/PurchaseReturn",
                },
              ].map((stat, index) => (
                <div key={index} className="col-lg-3 col-6" style={{ marginBottom: "15px" }}>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "15px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      height: "100%",
                      transition: "transform 0.3s",
                      ":hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ margin: "0 0 5px", fontSize: "24px", color: stat.color, fontWeight: "600" }}>
                          {stat.count}
                        </h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "#7f8c8d" }}>
                          {stat.label}
                        </p>
                      </div>
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          backgroundColor: `${stat.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i
                          className={index === 3 ? "ion ion-archive" : "ion ion-bag"}
                          style={{ color: stat.color, fontSize: "20px" }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "15px",
                        paddingTop: "10px",
                        borderTop: "1px solid #eee",
                        color: stat.color,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onClick={() => navigate(stat.path)}
                    >
                      <span>More info</span>
                      <i className="fas fa-arrow-circle-right" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row" style={{ marginBottom: "20px" }}>
              <div className="col-lg-6" style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    height: "100%",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px", fontSize: "18px", color: "#2c3e50" }}>
                    Order Status Distribution
                  </h3>
                  <canvas
                    ref={pieChart1Ref}
                    width="300"
                    height="300"
                    style={{ maxWidth: "100%", margin: "0 auto", display: "block" }}
                  />
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                      <div style={{ display: "inline-block", margin: "5px 10px" }}>
                        <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#FF5722", marginRight: "5px" }}></span>
                        <span>New ({newOrdersCount})</span>
                      </div>
                      <div style={{ display: "inline-block", margin: "5px 10px" }}>
                        <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#2196F3", marginRight: "5px" }}></span>
                        <span>Accepted ({acceptedOrdersCount})</span>
                      </div>
                      <div style={{ display: "inline-block", margin: "5px 10px" }}>
                        <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#4CAF50", marginRight: "5px" }}></span>
                        <span>Shipped ({shippedOrdersCount})</span>
                      </div>
                      <div style={{ display: "inline-block", margin: "5px 10px" }}>
                        <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#9C27B0", marginRight: "5px" }}></span>
                        <span>Returned ({returnedOrdersCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6" style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    height: "100%",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px", fontSize: "18px", color: "#2c3e50" }}>
                    Recent Orders
                  </h3>
                  <canvas
                    ref={barChartRef}
                    width="300"
                    height="300"
                    style={{ maxWidth: "100%", margin: "0 auto", display: "block" }}
                  />
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
                      Showing {Math.min(purchases.filter(p => p.vendor === vendorFirmName).length, 6)} of {purchases.filter(p => p.vendor === vendorFirmName).length} orders
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-7">
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#2c3e50" }}>
                      Recent Purchase Orders
                    </h3>
                    <button
                      style={{
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      onClick={() => navigate("/Purchase")}
                    >
                      View All
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8f9fa" }}>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Order ID</th>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Items</th>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Date</th>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases
                          .filter(p => p.vendor === vendorFirmName)
                          .slice(0, 5)
                          .map((purchase) => (
                            <tr key={purchase.id} style={{ borderBottom: "1px solid #eee" }}>
                              <td style={{ padding: "10px" }}>
                                <span style={{ fontWeight: "500" }}>{purchase.purchaseOrderId || `PO${purchase.id}`}</span>
                              </td>
                              <td style={{ padding: "10px" }}>{purchase.totalItems || 0}</td>
                              <td style={{ padding: "10px" }}>{purchase.orderDate || "N/A"}</td>
                              <td style={{ padding: "10px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "5px 10px",
                                    borderRadius: "20px",
                                    backgroundColor: `${getStatusColor(purchase.status)}20`,
                                    color: getStatusColor(purchase.status),
                                    fontSize: "12px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {getStatusText(purchase.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        {purchases.filter(p => p.vendor === vendorFirmName).length === 0 && (
                          <tr>
                            <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#7f8c8d" }}>
                              No purchase orders found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px", fontSize: "18px", color: "#2c3e50" }}>
                    Action Items
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[
                      {
                        text: "Review new purchase orders",
                        time: newOrdersCount > 0 ? "Urgent" : "Up to date",
                        priority: newOrdersCount > 0 ? "high" : "low",
                      },
                      {
                        text: "Process accepted orders",
                        time: acceptedOrdersCount > 0 ? "Today" : "No pending",
                        priority: acceptedOrdersCount > 0 ? "medium" : "low",
                      },
                      { 
                        text: "Update shipping information", 
                        time: shippedOrdersCount > 0 ? "Pending" : "Complete", 
                        priority: shippedOrdersCount > 0 ? "medium" : "low" 
                      },
                      { 
                        text: "Handle returned orders", 
                        time: returnedOrdersCount > 0 ? "Action needed" : "None", 
                        priority: returnedOrdersCount > 0 ? "high" : "low" 
                      },
                    ].map((task, index) => (
                      <li
                        key={index}
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #eee",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{
                            marginRight: "10px",
                            width: "18px",
                            height: "18px",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "500" }}>{task.text}</div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#7f8c8d",
                              display: "flex",
                              alignItems: "center",
                              marginTop: "3px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor:
                                  task.priority === "high"
                                    ? "#e74c3c"
                                    : task.priority === "medium"
                                    ? "#f39c12"
                                    : "#2ecc71",
                                marginRight: "5px",
                              }}
                            />
                            {task.time}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-lg-5">
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    marginBottom: "20px",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px", fontSize: "18px", color: "#2c3e50" }}>
                    Recent Activity
                  </h3>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {[...purchases, ...returnOrders]
                      .filter(order => order.vendor === vendorFirmName)
                      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                      .slice(0, 5)
                      .map((order, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "10px 0",
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: `${getStatusColor(order.status)}20`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "10px",
                              flexShrink: 0,
                              color: getStatusColor(order.status),
                              fontWeight: "bold",
                            }}
                          >
                            <i className={order.purchaseReturnId ? "ion ion-archive" : "ion ion-bag"} />
                          </div>
                          <div>
                            <div style={{ fontWeight: "500" }}>
                              {order.purchaseReturnId ? "Return Order" : "Purchase Order"}{" "}
                              <span style={{ fontWeight: "400" }}>
                                {order.purchaseOrderId || order.purchaseReturnId || `ID${order.id}`} {order.status === 0 ? "received" : "updated"}
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                              {order.orderDate || "N/A"} • Status: {getStatusText(order.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    {purchases.filter(p => p.vendor === vendorFirmName).length === 0 && 
                     returnOrders.filter(r => r.vendor === vendorFirmName).length === 0 && (
                      <div style={{ padding: "20px", textAlign: "center", color: "#7f8c8d" }}>
                        No recent activity found
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px", fontSize: "18px", color: "#2c3e50" }}>
                    Performance Metrics
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                    <div style={{ flex: "1", minWidth: "120px" }}>
                      <div style={{ 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "8px", 
                        padding: "15px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "24px", fontWeight: "600", color: "#2c3e50" }}>
                          {totalOrders}
                        </div>
                        <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                          Total Orders
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: "1", minWidth: "120px" }}>
                      <div style={{ 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "8px", 
                        padding: "15px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "24px", fontWeight: "600", color: "#4CAF50" }}>
                          {shippedOrdersCount}
                        </div>
                        <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                          Shipped
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: "1", minWidth: "120px" }}>
                      <div style={{ 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "8px", 
                        padding: "15px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "24px", fontWeight: "600", color: "#9C27B0" }}>
                          {returnedOrdersCount}
                        </div>
                        <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                          Returns
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: "1", minWidth: "120px" }}>
                      <div style={{ 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "8px", 
                        padding: "15px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "24px", fontWeight: "600", color: "#2196F3" }}>
                          {totalOrders > 0 ? Math.round((shippedOrdersCount / totalOrders) * 100) : 0}%
                        </div>
                        <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                          Fulfillment Rate
                        </div>
                      </div>
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

export default Dashboard;