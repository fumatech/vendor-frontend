import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessDetails.css";

function BusinessDetails() {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState({
    vendorId: "",
    firmName: "",
    shopActNumber: "",
    cinNumber: "",
    taxOrGstNumber: "",
    panNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");
        if (!email) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/getall`
        );
        if (!response.ok) throw new Error("Failed to fetch vendor data");

        const data = await response.json();
        const vendor = data.find((vendor) => vendor.email === email);

        if (!vendor) throw new Error("Vendor not found");

        setVendorData({
          vendorId: vendor.vendorId || "N/A",
          firmName: vendor.firmName || "N/A",
          shopActNumber: vendor.shopActNumber || "N/A",
          cinNumber: vendor.cinNumber || "N/A",
          taxOrGstNumber: vendor.taxOrGstNumber || "N/A",
          panNumber: vendor.panNumber || "N/A",
        });
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setMessage({ text: "Failed to load business details", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-5">Loading business details...</div>;
  }

  const detailRows = [
    { label: "Vendor ID", value: vendorData.vendorId },
    { label: "Firm Name", value: vendorData.firmName },
    { label: "Shop Act Number", value: vendorData.shopActNumber },
    { label: "CIN Number", value: vendorData.cinNumber },
    { label: "Tax/GST Number", value: vendorData.taxOrGstNumber },
    { label: "PAN Number", value: vendorData.panNumber },
  ];

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading fs-2">Business Details</h1>
              </div>
            </div>
          </div>
        </section>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <section className="content">
          <div className="container-fluid">
            <div className="card rounded-4 border-0 cardHover business-details-card">
              <div className="card-body">
                <div className="business-details-table-wrapper">
                  <table className="table business-details-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Business Field</th>
                        <th scope="col">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRows.map((row) => (
                        <tr key={row.label}>
                          <td data-label="Business Field">{row.label}</td>
                          <td data-label="Details">{row.value || "N/A"}</td>
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
}

export default BusinessDetails;
