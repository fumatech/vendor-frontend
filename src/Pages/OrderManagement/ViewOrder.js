import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import $ from "jquery";

function ViewOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [orderID, setOrderID] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});
  const [vendorlist, setVendorList] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/get/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch purchase data");
        }

        const purchase = await response.json();
        console.log(purchase);
        // Setting state based on the fetched data
        setVendor(purchase.vendor);
        setReferenceNumber(purchase.referenceNumber);
        setOrderID(purchase.purchaseOrderId);
        setCustomerName(purchase.purchaseOrderId);
        setAddedBy(purchase.addedBy);
        setOrderDate(new Date(purchase.orderDate));
        setLocation(purchase.location);
        setAdditionalNotes(purchase.additionalNotes);
        setStatus(purchase.status);

        // Pre-select products and variations
        const selectedProducts = purchase.orderItems.map((item) => ({
          id: item.id,
          productName: item.productName,
          sku: item.productSku,
          quantity: item.quantity,
          productVariationName: item.productVariationName,
          productVariationId: item.productVariationId,
        }));

        const selectedVariations = {};
        purchase.orderItems.forEach((item) => {
          selectedVariations[item.productVariationId] = true;
        });

        setSelectedProducts(selectedProducts);
        setSelectedVariations(selectedVariations);

        setProductsData(purchase.orderItems);
        setTotalUnits(purchase.totalItems);
      } catch (error) {
        console.error("Error fetching purchase data:", error);
      }
    };

    fetchPurchaseData();
  }, [id]);

  useEffect(() => {
    const totalUnits = selectedProducts.reduce(
      (total, product) => total + product.quantity,
      0
    );
  }, [selectedProducts]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/getall`
        );
        const data = await response.json();
        setVendorList(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const calculatedTotalUnits = selectedProducts.reduce((total, product) => {
      return total + product.quantity;
    }, 0);
    setTotalUnits(calculatedTotalUnits);
  }, [selectedProducts]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      await searchProducts(value);
    } else {
      setSearchResults([]);
    }
  };

  const searchProducts = async (query) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/product/search?query=${query}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchProducts(searchTerm);
    }
  };

  const handleAddProduct = (product) => {
    const variationsToAdd = product.productVariations.filter(
      (variation) => selectedVariations[variation.id]
    );

    if (variationsToAdd.length === 0) {
      alert("Please select at least one variation to add.");
      return;
    }
    const newProducts = variationsToAdd
      .map((variation) => {
        const isDuplicate = selectedProducts.some(
          (p) => p.id === product.id && p.variationId === variation.id
        );
        if (!isDuplicate) {
          return {
            ...product,
            ...variation,
            quantity: 1,
            discountPercent: 0,
          };
        }
        return null;
      })
      .filter(Boolean);
    setSelectedProducts((prev) => [...prev, ...newProducts]);
    setSelectedVariations({});
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleVariationSelect = (variationId, isSelected) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variationId]: isSelected,
    }));
  };

  const handleQuantityChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, quantity: parseInt(value) } : product
      )
    );
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchaseorder/updateStatus/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (response.ok) {
        console.log(`Purchase order status updated to ${newStatus}`);
        navigate(newStatus === 1 ? "/AcceptedOrders" : "/RejectedOrders");
      } else {
        const errorText = await response.text();
        console.error("Error updating purchase order status:", errorText);
        alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const printData = () => {
    const printContent = document.getElementById("print-content");
    const clonedContainer = printContent.cloneNode(true);
    const $clonedContainer = $(clonedContainer);

    // Remove elements that shouldn't be included in the print view
    $clonedContainer.find(".no-print").remove();

    // Open the print window and display the content
    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write("<html><head><title>Purchase Order</title>");
    printWindow.document.write(`
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          color: #000;
          background: #fff;
          padding: 20px;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .print-header h2 {
          margin: 0;
          font-size: 24pt;
        }
        .order-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .order-info div {
          flex: 1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          page-break-inside: avoid;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .total-units {
          text-align: right;
          font-weight: bold;
          margin-top: 10px;
        }
        .print-footer {
          margin-top: 30px;
          text-align: right;
          border-top: 2px solid #000;
          padding-top: 10px;
        }
        textarea {
          border: none;
          resize: none;
          width: 100%;
          background: transparent;
        }
        input, .form-control {
          border: none;
          background: transparent;
          width: 100%;
          padding: 0;
        }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(clonedContainer.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="all-heading">View Ordered Order</h1>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <form>
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row no-print">
                      <div className="col-md-12 text-right mb-3">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={printData}
                        >
                          <i className="fas fa-print mr-2"></i> Print Order
                        </button>
                      </div>
                    </div>
                    <div id="print-content">
                      <div className="print-header">
                        <h2>Purchase Order</h2>
                      </div>

                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="orderId">
                              Customer Name
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control rounded"
                              id="orderId"
                              name="orderId"
                              placeholder="Enter here.."
                              value="Fuma"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="orderId">
                              Order Id<span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control rounded"
                              id="orderId"
                              name="orderId"
                              placeholder="Enter here.."
                              value={orderID}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="referenceNumber">
                              Reference No<span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control rounded"
                              id="referenceNumber"
                              name="referenceNumber"
                              placeholder="Enter here.."
                              value={referenceNumber}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="addedBy">
                              Added By<span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control rounded"
                              id="addedBy"
                              name="addedBy"
                              placeholder="Enter here..."
                              value={addedBy}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group d-flex flex-row  flex-md-column ">
                            <label htmlFor="transaction_date">Order Date</label>
                            <DatePicker
                              selected={orderDate}
                              className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                              dateFormat="MM/dd/yyyy"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="location">
                              Location<span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control rounded"
                              id="location"
                              name="location"
                              placeholder="Enter here.."
                              value={location}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mt-4">
                        <div className="col-md-12">
                          <h4>Order Items</h4>
                          {selectedProducts.length > 0 && (
                            <div className="table-responsive">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Product Name</th>
                                    <th>SKU</th>
                                    <th>Variation</th>
                                    <th>Quantity</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedProducts.map((product, index) => {
                                    return (
                                      <tr key={product.id}>
                                        <td>{index + 1}</td>
                                        <td>{product.productName}</td>
                                        <td>{product.sku}</td>
                                        <td>
                                          {product.productVariationName ||
                                            product.name}
                                        </td>
                                        <td>
                                          <input
                                            type="number"
                                            value={product.quantity}
                                            min="1"
                                            readOnly
                                            disabled
                                            className="form-control"
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              <div className="total-units">
                                <strong>Total Units: {totalUnits}</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="row mt-4">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label>
                              <strong>Additional Notes</strong>
                            </label>
                            <textarea
                              className="form-control"
                              rows="3"
                              name="additional_notes"
                              cols="50"
                              id="additional_notes"
                              value={additionalNotes}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="print-footer">
                        <p>Generated on: {new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row no-print">
                  <div className="col-12 text-right">
                    <button
                      type="button"
                      className="btn btn-primary mr-2"
                      onClick={printData}
                    >
                      <i className="fas fa-print"></i> Print
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default ViewOrder;
