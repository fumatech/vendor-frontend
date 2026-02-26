import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import Select from "react-select";

function AddWarrantyClaim() {
  const navigate = useNavigate();
  const [adjustmentDate, setAdjustmentDate] = useState(new Date());
  const [status, setStatus] = useState(""); // Changed from adjustmentType to status
  const [businessLocation, setBusinessLocation] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [locations, setLocations] = useState([]);
  const [productList, setProductList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [amountRecovered, setAmountRecovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalUnits, setTotalUnits] = useState(0); // New state for total units
  const [addedBy, setAddedBy] = useState("");
  const [userEmail, setUserEmail] = useState(null);

  const businessLocationOptions = [{ value: "FUMA", label: "FUMA" }];
  const selectMenuProps = {
    menuPortalTarget: document.body,
    menuPosition: "fixed",
    styles: {
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      menu: (base) => ({ ...base, zIndex: 9999 }),
    },
  };
  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      await searchProducts(value);
    } else {
      setSearchResults([]); // Clear results if the search term is empty
    }
  };
  const searchProducts = async (query) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/product/search?query=${query}`
      );
      const data = await response.json();
      setSearchResults(data); // Set the search results
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
    // Check if there is already a product added
    if (selectedProducts.length > 0) {
      alert(
        "You can only add one product at a time. Please remove the existing product before adding another."
      );
      return;
    }

    // Filter the variations that are selected
    const variationsToAdd = product.productVariations.filter(
      (variation) => selectedVariations[variation.id] // Only add selected variations
    );

    if (variationsToAdd.length === 0) {
      alert("Please select at least one variation to add.");
      return;
    }

    // If no duplicate, proceed with adding the product
    const newProducts = variationsToAdd
      .map((variation) => ({
        ...product,
        ...variation,
        productId: product.id,
        productVariationId: variation.id,
        quantity: 1, // Default quantity
        discountPercent: 0, // Default discount percent
      }))
      .filter(Boolean); // Filter out any null values

    setSelectedProducts(newProducts); // Clear the existing selection and add the new product
    setSelectedVariations({}); // Clear selected variations after adding

    // Clear search results and reset the search term
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
  const handleReferenceNumberChange = (event) =>
    setReferenceNumber(event.target.value);
  const handleStatusChange = (event) => setStatus(event.target.value); // Changed from handleAdjustmentTypeChange to handleStatusChange

  const handleBusinessLocationChange = (event) =>
    setBusinessLocation(event.target.value);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const handleReasonChange = (event) => setReason(event.target.value);

  const handleAmountRecovered = (event) =>
    setAmountRecovered(event.target.value);

  const calculateTotalAmount = (shipping) => {
    const total =
      productList.reduce((acc, item) => acc + item.price * item.quantity, 0) +
      shipping;
    setTotalAmount(total);
  };
  useEffect(() => {
    const units = selectedProducts.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    setTotalUnits(units);
  }, [selectedProducts]);

  useEffect(() => {
    const amount = selectedProducts.reduce(
      (sum, product) => sum + product.defaultSellingPrice * product.quantity,
      0
    );
    setTotalAmount(amount);
  }, [selectedProducts]);

  const handleProductSelect = (product) => {
    const exists = productList.find((item) => item.id === product.id);
    if (!exists) {
      setProductList([...productList, { ...product, quantity: 1 }]);
    }
    setSearchTerm(""); // Clear search after selection
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!businessLocation) {
      alert("Business Location is required.");
      return;
    }

    // Prepare stock adjustment data for warranty claim
    const stockAdjustmentData = {
      businessLocation,
      referenceNumber,
      date: adjustmentDate.toISOString(),
      status: 0,
      totalAmount,
      totalUnits,
      reason,
      warrantyClaimItems: selectedProducts.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        productSku: product.productSku,
        productVariationId: product.productVariationId,
        productVariationName: product.variationName,
        quantity: product.quantity,
        lineTotal: product.unitSellingPrice * product.quantity,
        unitSellingPrice: product.defaultSellingPrice,
      })),
      stockTransaction: selectedProducts.map((product) => ({
        productId: product.productId,
        variationId: product.productVariationId,
        quantity: product.quantity,
        transactionType: "warranty_claimed",
        date: adjustmentDate.toISOString(),
        note: "Warranty - Product Claimed", // Customize if needed
      })),
    };

    try {
      setLoading(true); // Show loading indicator before API calls

      // Step 1: Save Warranty Claim
      const warrantyClaimResponse = await fetch(
        "http://localhost:8081/warranty-claim/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockAdjustmentData),
        }
      );

      if (!warrantyClaimResponse.ok) {
        throw new Error("Failed to save warranty claim.");
      }

      const warrantyClaimData = await warrantyClaimResponse.json(); // Assuming the response contains relevant data

      // Step 2: Save Stock Transaction (Warranty Claimed)
      const stockTransactionClaimData = selectedProducts.map((product) => ({
        productId: product.productId,
        variationId: product.productVariationId,
        quantity: product.quantity,
        transactionType: "warranty_replaced",
        date: adjustmentDate.toISOString(),
        note: "Warranty - Product Repalced", // Customize if needed
      }));

      const stockTransactionClaimResponse = await fetch(
        "http://localhost:8081/stock-transactions/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockTransactionClaimData),
        }
      );

      if (!stockTransactionClaimResponse.ok) {
        throw new Error(
          "Failed to record stock transaction for warranty claim."
        );
      }

      // Step 3: Save Stock Transaction (Warranty Replaced)
      const stockTransactionReplaceData = selectedProducts.map((product) => ({
        productId: product.productId,
        variationId: product.productVariationId,
        quantity: product.quantity,
        transactionType: "warranty_return",
        date: adjustmentDate.toISOString(),
        note: "Warranty - Product Return", // Customize if needed
      }));

      const stockTransactionReplaceResponse = await fetch(
        "http://localhost:8081/stock-transactions/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockTransactionReplaceData),
        }
      );

      if (!stockTransactionReplaceResponse.ok) {
        throw new Error(
          "Failed to record stock transaction for warranty replacement."
        );
      }

      // If all API calls are successful, show success message and navigate
      alert("Warranty saved successfully.");
      navigate("/ListWarrantyClaim");
    } catch (error) {
      setError("Error saving stock warranty: " + error.message);
      console.error(error);
    } finally {
      setLoading(false); // Hide loading indicator after all API calls
    }
  };

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-md-6">
                  <h1 className=" all-heading">Add Warranty Claim </h1>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <form onSubmit={handleSubmit}>
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="form-group col-md-3">
                        <label htmlFor="businessLocation">
                          Business Location:*
                        </label>
                        <Select
                          inputId="businessLocation"
                          options={businessLocationOptions}
                          value={
                            businessLocationOptions.find(
                              (option) =>
                                String(option.value) ===
                                String(businessLocation)
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            setBusinessLocation(selectedOption?.value || "")
                          }
                          placeholder="Please Select"
                          isSearchable
                          {...selectMenuProps}
                        />
                      </div>{" "}
                      <div className="form-group col-md-3">
                        <label htmlFor="referenceNumber">Reference No:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="referenceNumber"
                          name="referenceNumber"
                          required
                          onChange={handleReferenceNumberChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">Date:*</label>
                          <DatePicker
                            selected={adjustmentDate}
                            onChange={(date) => setAdjustmentDate(date)}
                            dateFormat="MM/dd/yyyy"
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
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
                            value={userEmail}
                            onChange={(e) => setAddedBy(e.target.value)}
                            required
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="search-bar">
                          <div className="search-input w-100">
                            <i className="fa fa-search search-icon"></i>
                            <input
                              type="text"
                              placeholder="Enter Product name / SKU / Scan bar code"
                              value={searchTerm}
                              onChange={handleSearch}
                              onKeyPress={handleKeyPress} // Listen for Enter key press
                            />
                          </div>
                        </div>

                        <div className="product-list">
                          {searchTerm && searchResults.length > 0 ? (
                            searchResults.map((product) => (
                              <div key={product.id} className="product-item">
                                <span className="product-name">
                                  {product.productName} ({product.sku}) - Stock:{" "}
                                </span>
                                {product.productVariations.length > 0 && (
                                  <div className="variations">
                                    <ul>
                                      {product.productVariations.map(
                                        (variation) => (
                                          <li key={variation.id}>
                                            <label>
                                              <input
                                                type="checkbox"
                                                checked={
                                                  selectedVariations[
                                                    variation.id
                                                  ] || false
                                                }
                                                onChange={(e) =>
                                                  handleVariationSelect(
                                                    variation.id,
                                                    e.target.checked
                                                  )
                                                }
                                              />
                                              {variation.name}{" "}
                                              {variation.variationValue} -
                                              Price:{" "}
                                              {
                                                variation.defaultPurchasePriceExcTax
                                              }
                                            </label>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleAddProduct(product)}
                                  className="btn btn-add-variation btn-success"
                                >
                                  Add Selected Variations
                                </button>
                              </div>
                            ))
                          ) : searchTerm && searchResults.length === 0 ? (
                            <div className="no-results highlight-message">
                              No products found or the search term is invalid.
                            </div>
                          ) : null}
                        </div>

                        {selectedProducts.length > 0 && (
                          <div className="table-responsive">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Product Name</th>
                                  <th>Quantity</th>
                                  <th>Unit Selling Price (Inc. tax)</th>
                                  <th>Line Total</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedProducts.map((product, index) => {
                                  const unitCostBeforeDiscount =
                                    product.defaultPurchasePriceExcTax || 0;
                                  const unitCostAfterDiscount =
                                    unitCostBeforeDiscount *
                                    (1 - (product.discountPercent || 0) / 100);
                                  const lineTotal =
                                    product.defaultSellingPrice *
                                    product.quantity;

                                  const defaultSellingPrice =
                                    product.defaultSellingPrice;

                                  return (
                                    <tr key={product.id}>
                                      <td>{index + 1}</td>
                                      <td>
                                        {product.productName} ({product.sku}) (
                                        {product.productVariationId})
                                        {product.name} {product.variationValue}
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          value={product.quantity}
                                          min="1"
                                          readOnly
                                          onChange={(e) =>
                                            handleQuantityChange(
                                              product.id,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>{defaultSellingPrice.toFixed(2)}</td>

                                      <td>{lineTotal.toFixed(2)}</td>

                                      <td>
                                        <button
                                          type="button"
                                          className="btn btn-danger"
                                          onClick={() =>
                                            handleRemoveProduct(product.id)
                                          }
                                        >
                                          <i className="fa fa-trash"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            <div>Total Amount: ₹{totalAmount}</div>
                            <div>Total units : {totalUnits}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="reason">Reason:</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            name="reason"
                            id="reason"
                            required
                            onChange={handleReasonChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="container-fluid text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-save btn-lg px-4 py-2 m-2 "
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
export default AddWarrantyClaim;
