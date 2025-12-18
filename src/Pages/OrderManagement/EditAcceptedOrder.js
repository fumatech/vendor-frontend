import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function EditAcceptedOrder() {
  const { id } = useParams();
  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [orderID, setOrderID] = useState("");
  const [deliveryDate, setDeliveryDate] = useState();
  const [addedBy, setAddedBy] = useState("");
  const [orderDate, setOrderDate] = useState();
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
  const [initialQuantities, setInitialQuantities] = useState({});
  const [updatedTotalUnits, setUpdatedTotalUnits] = useState(0);
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();
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

        setVendor(purchase.vendor);
        setReferenceNumber(purchase.referenceNumber);
        setOrderID(purchase.purchaseOrderId);

        setAddedBy(purchase.addedBy);
        setOrderDate(new Date(purchase.orderDate));
        if (purchase?.deliveryDate && !isNaN(new Date(purchase.deliveryDate))) {
          setDeliveryDate(new Date(purchase.deliveryDate));
        }
        setLocation(purchase.location);
        setAdditionalNotes(purchase.additionalNotes);

        const selectedProducts = purchase.orderItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.productSku,
          quantity: item.quantity,
          updatedQuantity: item.updatedQuantity ?? item.quantity,
          variationValue: item.productVariationName,
          productVariationId: item.productVariationId,
        }));

        const initialQuantities = purchase.orderItems.reduce((acc, item) => {
          acc[item.productVariationId] = item.quantity;
          return acc;
        }, {});

        setInitialQuantities(initialQuantities);
        setSelectedProducts(selectedProducts);
        setProductsData(purchase.orderItems);

        const totalBeforeEdit = purchase.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setTotalUnits(totalBeforeEdit);
      } catch (error) {
        console.error("Error fetching purchase data:", error);
      }
    };

    fetchPurchaseData();
  }, [id]);

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

  useEffect(() => {
    const calculatedTotalShippedUnits = selectedProducts.reduce(
      (shiptotal, product) => {
        return shiptotal + (product.updatedQuantity || 0);
      },
      0
    );
    setUpdatedTotalUnits(calculatedTotalShippedUnits);
  }, [selectedProducts]);

  const handleUpdatedQuantityChange = (productId, newQuantity) => {
    const product = selectedProducts.find((p) => p.id === productId);

    const quantityValue = parseInt(newQuantity) || 0;

    if (quantityValue > product.quantity) {
      alert(
        `Shipping quantity cannot exceed the order quantity (${product.quantity}) for this product.`
      );
      return;
    }

    if (quantityValue < 0) {
      alert("Shipping quantity cannot be negative.");
      return;
    }

    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, updatedQuantity: quantityValue }
          : product
      )
    );
    setValidationError("");
  };

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
            updatedQuantity: 1,
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

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAdditionalNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const validateQuantities = () => {
    const invalidProducts = selectedProducts.filter(
      (product) => product.updatedQuantity > product.quantity
    );

    if (invalidProducts.length > 0) {
      setValidationError(
        "Some products have shipping quantities greater than their order quantities. Please correct them before saving."
      );
      return false;
    }

    if (updatedTotalUnits > totalUnits) {
      setValidationError(
        "Total shipping quantity cannot exceed total order quantity."
      );
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderDate || !deliveryDate) {
      alert("Please select order date and delivery date");
      return;
    }

    const formattedOrderDate = orderDate.toISOString().split("T")[0];
    const formattedDeliveryDate = deliveryDate.toISOString().split("T")[0];

    const orderItems = selectedProducts.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.productVariationId
        ? String(product.variationId)
        : null,
      productVariationName: product.variationValue,
      quantity: product.quantity || 0,
      updatedQuantity: product.updatedQuantity || 0,
    }));

    const payload = {
      vendor,
      status: 3,
      referenceNumber,
      addedBy,
      orderDate: formattedOrderDate,
      deliveryDate: formattedDeliveryDate,
      location,
      totalItems: totalUnits,
      additionalNotes,
      orderItems,
      totalShippedItems: updatedTotalUnits,
    };

    try {
      const formData = new FormData();
      formData.append("purchaseOrder", JSON.stringify(payload));
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchaseorder/update/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        alert("Purchase Order updated successfully");
        navigate("/ShipOrders");
      } else {
        const errText = await response.text();
        console.error("Update failed:", errText);
        alert("Failed to update Purchase Order");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating the Purchase Order");
    }
  };

  return (
    <>
      <div className="wrapper">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="all-heading">Ship Order</h1>
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
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="CustomerName">
                            Customer Name<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="CustomerName"
                            name="CustomerName"
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
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            required
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
                            onChange={(e) => setAddedBy(e.target.value)}
                            required
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">Order Date</label>
                          <DatePicker
                            selected={orderDate}
                            onChange={(date) => setOrderDate(date)}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            readOnly
                            minDate={new Date()}
                            popperPlacement="top"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group d-flex flex-row flex-md-column">
                          <label htmlFor="transaction_date">
                            Delivery Date
                          </label>
                          <DatePicker
                            selected={deliveryDate}
                            onChange={setDeliveryDate}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
                            required
                            readOnly
                            minDate={new Date()}
                            popperPlacement="top"
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
                        {selectedProducts.length > 0 && (
                          <div className="table-responsive">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Product Name</th>
                                  <th>Order Quantity</th>
                                  <th>Shipping Quantity</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedProducts.map((product, index) => (
                                  <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                      {product.productName} ({product.sku}){" "}
                                      {product.name} {product.variationValue}
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        value={product.quantity}
                                        readOnly
                                        className="form-control"
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        min="0"
                                        max={product.quantity}
                                        value={product.updatedQuantity}
                                        onChange={(e) =>
                                          handleUpdatedQuantityChange(
                                            product.id,
                                            e.target.value
                                          )
                                        }
                                        className="form-control"
                                      />
                                      <small className="text-muted">
                                        Max: {product.quantity}
                                      </small>
                                    </td>
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
                                ))}
                              </tbody>
                            </table>
                            <div>Total units : {totalUnits}</div>
                            <div>Total Shipped units : {updatedTotalUnits}</div>
                            {validationError && (
                              <div className="alert alert-danger mt-3">
                                {validationError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Additional Notes</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="additional_notes"
                            cols="50"
                            id="additional_notes"
                            value={additionalNotes}
                            onChange={handleAdditionalNotesChange}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="container-fluid text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-save btn-lg px-4 py-2 m-2"
                    disabled={!!validationError}
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

export default EditAcceptedOrder;
