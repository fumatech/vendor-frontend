import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function UploadInvoice() {
  const navigate = useNavigate();
  const [deliveryDate, setDeliveryDate] = useState();
  const { id } = useParams();
  const [vendor, setVendor] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [orderID, setOrderID] = useState("");
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
  const [totalUnits, setTotalUnits] = useState(0); // New state for total units
  const [initialQuantities, setInitialQuantities] = useState({});
  const [updatedTotalUnits, setUpdatedTotalUnits] = useState(0);

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

        console.log(purchase.totalShippedItems);
        setUpdatedTotalUnits(purchase.totalShippedItems);
        const selectedProducts = purchase.orderItems.map((item) => ({
          id: item.id,
          productName: item.productName,
          sku: item.productSku,
          productId: item.productId,
          quantity: item.quantity,
          updatedQuantity: item.updatedQuantity,
          variationValue: item.productVariationName,
          productVariationId: item.productVariationId,
        }));
        const initialQuantities = purchase.orderItems.reduce((acc, item) => {
          acc[item.productVariationId] = item.quantity;
          return acc;
        }, {});
        setInitialQuantities(initialQuantities); // Set initial quantities
        setSelectedProducts(selectedProducts);
        setProductsData(purchase.orderItems);
        setTotalUnits(purchase.totalItems);
        const totalBeforeEdit = purchase.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setTotalUnits(totalBeforeEdit); // Set total items before edit
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
        setVendorList(data); // Set the search results
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
    setTotalUnits(calculatedTotalUnits); // Set the total units amount
  }, [selectedProducts]);

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
    const variationsToAdd = product.productVariations.filter(
      (variation) => selectedVariations[variation.id] // Only add selected variations
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
            ...variation, // Spread variation properties into product object
            quantity: 1, // Set default quantity
            discountPercent: 0, // Set default discount percent
          };
        }
        return null; // Return null for duplicates
      })
      .filter(Boolean); // Remove nulls from the array
    setSelectedProducts((prev) => [...prev, ...newProducts]);
    setSelectedVariations({}); // Clear selected variations after adding
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
    const updatedQuantity = parseInt(value, 10);

    setSelectedProducts((prev) => {
      return prev.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            totalShippedItems: updatedQuantity, // Store updated shipping quantity
          };
        }
        return product;
      });
    });
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare order items array
    const orderItems = selectedProducts.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.productVariationId
        ? String(product.productVariationId)
        : null,
      productVariationName: product.variationValue,
      quantity: product.quantity,
      updatedQuantity: product.updatedQuantity || product.quantity,
    }));

    // Prepare payload object
    const purchaseOrder = {
      id,
      vendor,
      referenceNumber,
      addedBy,
      orderDate: orderDate ? orderDate.toISOString().split("T")[0] : null,
      deliveryDate: deliveryDate
        ? deliveryDate.toISOString().split("T")[0]
        : null,
      location,
      totalItems: selectedProducts.reduce(
        (total, product) => total + product.quantity,
        0
      ),
      totalShippedItems: selectedProducts.reduce(
        (total, product) =>
          total + (product.updatedQuantity || product.quantity),
        0
      ),
      additionalNotes,
      orderItems,
      status: 3, // or purchaseStatus if your entity expects that
    };

    try {
      // Use FormData for file + JSON
      const formData = new FormData();
      formData.append("purchaseOrder", JSON.stringify(purchaseOrder));
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchaseorder/update/${id}`,
        {
          method: "PUT",
          body: formData, // No headers! Browser sets correct multipart boundary
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error updating purchase:", errorText);
        alert("Failed to update order. Please check your inputs.");
      } else {
        alert("Purchase updated successfully!");
        navigate("/ShipOrders");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
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
                  <h1 className="all-heading">View Shipped Order</h1>
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
                          <label htmlFor="orderId">
                            Customer Name<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded"
                            id="orderId"
                            name="orderId"
                            placeholder="Enter here.."
                            value="Fuma Business"
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
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="document">Attach Document</label>
                          <div className="file-input file-input-new">
                            <div className="input-group file-caption-main">
                              <div className="form-control file-caption kv-fileinput-caption">
                                <div className="file-caption-name">
                                  {file ? file.name : "No file chosen"}
                                </div>
                              </div>
                              <div className="input-group-btn">
                                <div className="btn">
                                  <i className=""></i>
                                  &nbsp;
                                  <input
                                    id="upload_document"
                                    accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png"
                                    name="document"
                                    type="file"
                                    onChange={handleFileChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="help-block">Max File size: 5MB</p>
                          </div>
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
                                  <th>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Shipping
                                    Quantity
                                  </th>
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
                                    {/* Order Quantity: Non-editable */}
                                    <td>
                                      <input
                                        type="number"
                                        value={product.quantity} // Initial order quantity
                                        readOnly // Make it non-editable
                                        className="form-control"
                                      />
                                    </td>
                                    <td>
                                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                      <input
                                        disabled
                                        type="number"
                                        value={product.updatedQuantity}
                                        min="1"
                                        onChange={(e) => {
                                          const updatedQuantity = parseInt(
                                            e.target.value,
                                            10
                                          );
                                          setSelectedProducts((prev) =>
                                            prev.map((p) =>
                                              p.id === product.id
                                                ? {
                                                    ...p,
                                                    updatedShippingQuantity:
                                                      updatedQuantity,
                                                  }
                                                : p
                                            )
                                          );
                                        }}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div>Total units : {totalUnits}</div>
                            <div>Total Shipped units : {updatedTotalUnits}</div>
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

export default UploadInvoice;
