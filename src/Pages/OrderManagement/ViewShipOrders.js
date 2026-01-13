import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function ViewShipOrders() {
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
  const [deliveryDate, setDeliveryDate] = useState(new Date());

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

        // Setting state based on the fetched data
        setVendor(purchase.vendor);
        setReferenceNumber(purchase.referenceNumber);

        setOrderID(purchase.purchaseOrderId);

        setAddedBy(purchase.addedBy);
        setOrderDate(new Date(purchase.orderDate));
        setLocation(purchase.location);
        setAdditionalNotes(purchase.additionalNotes);
        if (purchase?.deliveryDate && !isNaN(new Date(purchase.deliveryDate))) {
          setDeliveryDate(new Date(purchase.deliveryDate));
        }
        //console.log(purchase.totalShippedItems);
        setUpdatedTotalUnits(purchase.totalShippedItems);

        const selectedProducts = purchase.orderItems.map((item) => ({
          id: item.id,
          productName: item.productName,
          sku: item.productSku,
          quantity: item.quantity,
          updatedQuantity: item.updatedQuantity,
          variationValue: item.productVariationName,
          productVariationId: item.productVariationId,
        }));

        // Store the initial quantities
        const initialQuantities = purchase.orderItems.reduce((acc, item) => {
          acc[item.productVariationId] = item.quantity;
          return acc;
        }, {});

        setInitialQuantities(initialQuantities); // Set initial quantities

        setSelectedProducts(selectedProducts);
        setProductsData(purchase.orderItems);
        setTotalUnits(purchase.totalItems);

        // Set the initial total units (before edit)
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

    // Prepare the order items with both orderQuantity and updatedShipQuantity
    const orderItems = selectedProducts.map((product) => ({
      productName: product.productName,
      productSku: product.sku,
      productVariationId: product.id,
      productVariationName: product.variationValue,
      quantity: product.quantity, // This is the order quantity
      totalShippedItems: product.updatedShippingQuantity || product.quantity, // Shipping quantity (editable)
    }));

    // Prepare the payload
    const payload = {
      id, // Include purchase ID
      vendor,
      referenceNumber,
      addedBy,
      orderDate: orderDate ? orderDate.toISOString().split("T")[0] : null, // Format date to yyyy-mm-dd
      location,
      file,
      totalItems: selectedProducts.reduce(
        (total, product) => total + product.quantity,
        0
      ), // Sum of order quantities
      totalShippedItems: selectedProducts.reduce(
        (total, product) =>
          total + (product.updatedShippingQuantity || product.quantity), // Sum of updated shipping quantities
        0
      ),
      additionalNotes,
      orderItems,
      purchaseStatus: 3, // Purchase status to 3 (saved)
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/purchaseorder/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error updating purchase:", errorText);
        alert("Failed to update order. Please check your inputs.");
      } else {
        console.log("Purchase updated successfully");

        // Update the purchaseStatus
        const statusResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/purchaseorder/updateStatus/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ purchaseStatus: 3 }),
          }
        );

        if (statusResponse.ok) {
          console.log("Purchase status updated successfully");
          window.location.href = "/ShipOrders"; // Redirect
        } else {
          const errorText = await statusResponse.text();
          console.error("Error updating purchase status:", errorText);
          alert("Error updating status. Check logs.");
        }
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
                  <h1 className="all-heading">Ship Orders</h1>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <form>
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
                        <div className="form-group d-flex flex-row  flex-md-column ">
                          <label htmlFor="transaction_date">
                            Expected Delivery Date
                          </label>
                          <DatePicker
                            selected={deliveryDate}
                            className="form-control w-100 ms-1 ms-md-0 py-3 rounded-1"
                            dateFormat="MM/dd/yyyy"
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
                                    {/* Shipping Quantity: Editable */}
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
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default ViewShipOrders;
