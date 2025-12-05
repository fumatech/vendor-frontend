import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
            <div className="card rounded-4 border-0 cardHover">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="form-group">
                      <label>Vendor ID</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-id-card"></i>
                        </span>
                        <input
                          className="form-control"
                          value={vendorData.vendorId}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="form-group">
                      <label>Firm Name</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-building"></i>
                        </span>
                        <input
                          className="form-control"
                          value={vendorData.firmName}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="form-group">
                      <label>Shop Act Number</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-file-text"></i>
                        </span>
                        <input
                          className="form-control"
                          value={vendorData.shopActNumber}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="form-group">
                      <label>CIN Number</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-file-text"></i>
                        </span>
                        <input
                          className="form-control"
                          value={vendorData.cinNumber}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="form-group">
                      <label>Tax/GST Number</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-file-text"></i>
                        </span>
                        <input
                          className="form-control"
                          value={vendorData.taxOrGstNumber}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="form-group">
                      <label>PAN Number</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-file-text"></i>
                        </span>
                        <input
                          className="form-control"
                          value={vendorData.panNumber}
                          readOnly
                        />
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
}

export default BusinessDetails;