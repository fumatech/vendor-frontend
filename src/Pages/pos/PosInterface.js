import React, { useState, useEffect } from "react";

import Select from "react-select";

import "./POSInterface.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dropdown, Table } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";
import { Form } from "react-bootstrap";
import { Modal, Button, Row, Col } from "react-bootstrap";

const POSInterface = () => {
  const [paymentRows, setPaymentRows] = useState([
    { amount: 0, method: "Cash", account: "None" },
  ]);
  const [paymentNote, setPaymentNote] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [totalPayable, setTotalPayable] = useState(0);
  const [totalPaying, setTotalPaying] = useState(0);
  const [changeReturn, setChangeReturn] = useState(0);
  const [balance, setBalance] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sale, setSale] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [filteredItems, setFilteredItems] = useState([]);
  const [view, setView] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderTaxType, setOrderTaxType] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [totals, setTotals] = useState({
    discount: 0,
    orderTax: 0,
    shipping: 0,
    total: 0,
  });
  const [orderTax, setOrderTax] = useState(totals.orderTax);
  const [shipping, setShipping] = useState(totals.shipping);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();
  const [transactionsData, setTransactionsData] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [showTModal, setShowTModal] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:8081/customer/getall"); // Replace with your actual endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json(); // Assuming the response is in JSON format
        setCustomers(data); // Set the customer data to state
      } catch (error) {
        console.error("Error fetching customers:", error); // Handle errors
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchAllSell = async () => {
      try {
        const response = await fetch("http://localhost:8081/sale/getall");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log(data);

        // Assuming the data is an array, update the state accordingly
        if (Array.isArray(data)) {
          setTransactionsData(data);
          setActiveTab(0); // Set the first element as the active tab by default
        } else {
          console.error("Fetched data is not an array");
          setTransactionsData([]);
        }
      } catch (error) {
        console.error("Error fetching sell:", error);
        setTransactionsData([]);
      }
    };

    fetchAllSell();
  }, []);

  const customerOptions = [
    { value: "", label: "Walk-in Customer" },
    ...customers.map((customer) => ({
      value: customer.id,
      label: `${customer.firstName} ${customer.lastName}`,
    })),
  ];

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "${process.env.REACT_APP_BASE_URL}/categories/getall"
      );
      const data = await response.json();
      console.log(data);
      setCategories(data);
      console.log(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(
        "${process.env.REACT_APP_BASE_URL}/brands/getall"
      );
      const data = await response.json();
      console.log(data);
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleAddedProduct = (product) => {
    const existingProduct = selectedProducts.find(
      (p) => p.sku === product.sku && p.variationId === product.variationId
    );

    if (existingProduct) {
      alert("This product is already added.");
      return;
    }
    const newProduct = {
      id: product.id,
      productName: product.productName,
      sku: product.sku,
      productSellingPrice: product.sellingPrice || 0,
      variationId: product.variationId || null,
      variationName: product.variationName || "",
      variationValue: product.variationValue || "",
      quantity: 1,
      subtotal: product.sellingPrice || 0,
    };

    setSelectedProducts((prev) => [...prev, newProduct]);
    setSearchTerm("");
    setSearchResults([]);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          "${process.env.REACT_APP_BASE_URL}/customers/getall"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "${process.env.REACT_APP_BASE_URL}/product/getall"
        );
        if (Array.isArray(response.data)) {
          const sortedData = response.data.sort((a, b) => b.id - a.id);

          const filtered = sortedData.filter((product) => {
            const isCategoryMatch = selectedCategory
              ? String(product.category) === String(selectedCategory.id)
              : true;
            const isBrandMatch = selectedBrand
              ? String(product.brand) === String(selectedBrand.id)
              : true;
            return isCategoryMatch && isBrandMatch;
          });

          setFilteredProducts(filtered);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedBrand]);

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

      if (!data || data.length === 0) {
        setSearchResults([]);
        return;
      }

      const updatedProducts = data.map((product) => {
        const sellingPrice = product.productVariations[0]?.defaultSellingPrice;
        return {
          ...product,
          sellingPrice: sellingPrice || "Price not available",
        };
      });

      setSearchResults(updatedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddProduct = (product) => {
    const hasVariations =
      product.productVariations && product.productVariations.length > 0;

    const variation = hasVariations ? product.productVariations[0] : {};
    const price = hasVariations
      ? variation.defaultSellingPrice || 0
      : product.defaultSellingPrice || 0;

    const existingProduct = selectedProducts.find(
      (p) => p.sku === product.sku && p.variationId === (variation.id || null)
    );

    if (existingProduct) {
      alert("This product is already added.");
      return;
    }
    const newProduct = {
      id: product.id,
      productName: product.productName,
      sku: product.sku,
      productSellingPrice: price,
      variationId: variation.id || null,
      variationName: variation.name || "",
      variationValue: variation.variationValue || "",
      quantity: 1,
      subtotal: price,
    };

    setSelectedProducts((prev) => [...prev, newProduct]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveFromCart = (product) => {
    setSelectedProducts((prev) =>
      prev.filter(
        (p) => !(p.sku === product.sku && p.variationId === product.variationId)
      )
    );
  };

  const handleQuantityChange = (product, value) => {
    const updatedQuantity = Math.max(value, 1);
    setSelectedProducts((prev) => {
      const updatedProducts = prev.map((cartItem) =>
        cartItem.sku === product.sku &&
        cartItem.variationId === product.variationId
          ? {
              ...cartItem,
              quantity: updatedQuantity,
              subtotal: updatedQuantity * (cartItem.productSellingPrice || 0),
            }
          : cartItem
      );
      updateTotals(updatedProducts);
      return updatedProducts;
    });
  };

  const updateTotals = (updatedProducts) => {
    const totalItems = updatedProducts.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    const subtotal = updatedProducts.reduce(
      (sum, product) => sum + product.subtotal,
      0
    );

    let discountAmount = 0;
    if (discountType === "Percentage" && totals.discount > 0) {
      discountAmount = (subtotal * totals.discount) / 100;
    } else if (discountType === "Fixed" && totals.discount > 0) {
      discountAmount = Math.min(totals.discount, subtotal);
    }

    let taxAmount = 0;
    if (orderTaxType === "VAT") {
      taxAmount = (subtotal - discountAmount) * 0.1;
    } else if (orderTaxType === "GST") {
      taxAmount = (subtotal - discountAmount) * 0.18;
    } else if (orderTaxType === "CGST") {
      taxAmount = (subtotal - discountAmount) * 0.1;
    } else if (orderTaxType === "SGST") {
      taxAmount = (subtotal - discountAmount) * 0.08;
    }
    if (isNaN(taxAmount)) {
      return;
    }

    const shipping = totals.shipping > 0 ? totals.shipping : 0;

    const totalPrice = subtotal - discountAmount + taxAmount + shipping;

    if (isNaN(totalPrice)) {
      return;
    }
    setTotals((prev) => ({
      ...prev,
      products: totalItems,
      total: totalPrice,
    }));
  };

  const handleTotalsChange = (key, value) => {
    const updatedValue = parseFloat(value) || 0;
    setTotals((prev) => {
      const updatedTotals = { ...prev, [key]: updatedValue };
      updateTotals(selectedProducts);
      return updatedTotals;
    });
  };
  const handleBackClick = () => {
    navigate(`/Dashboard`);
  };
  const handleAdExpence = () => {
    navigate(`/AddExpence`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBrand(null);
    setShowCategoryModal(false);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedCategory(null);
    setShowBrandModal(false);
  };

  const handleCancel = () => {
    setSelectedProducts([]);
    setTotals({
      products: 0,
      total: 0,
      discount: 0,
      orderTax: 0,
      shipping: 0,
    });
  };

  const handleEditClick = (field) => {
    setFieldToEdit(field);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveChanges = () => {
    if (fieldToEdit === "discount") {
      handleTotalsChange("discount", discountAmount);
    }
    if (fieldToEdit === "orderTax") {
      handleTotalsChange("orderTax", orderTax);
    }
    if (fieldToEdit === "shipping") {
      handleTotalsChange("shipping", shipping);
    }
    setShowModal(false);
  };

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    altContactNumber: "",
    landline: "",
    dateOfBirth: "",
    assignedTo: "",
  });

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:8081/customer/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save customer");
        }
        return response.json();
      })
      .then(() => {
        alert("Customer added successfully!");
        handleClose();
      })
      .catch((error) => console.error("Error saving customer:", error));
  };

  useEffect(() => {
    calculateTotals();
  }, [paymentRows]);

  const addPaymentRow = () => {
    setPaymentRows([
      ...paymentRows,
      { amount: 0, method: "Cash", account: "None" },
    ]);
  };

  const updatePaymentRow = (index, field, value) => {
    const updatedRows = [...paymentRows];
    updatedRows[index][field] = value;
    setPaymentRows(updatedRows);
  };

  const calculateTotals = () => {
    const total = paymentRows.reduce(
      (sum, row) => sum + parseFloat(row.amount || 0),
      0
    );
    setTotalPaying(total);
    setChangeReturn(totalPayable - total);
    setBalance(totalPayable - total);
  };

  const handleFinalizePayment = () => {
    console.log("Payment finalized");
    closeModal();
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <div className="card cardHover rounded-4 border-0">
          <div className="card-body">
            <header className="pos-header row justify-content-between">
              <div className="col-4 header-left">
                <input type="text" placeholder="Location" defaultValue="Fuma" />
              </div>
              <div className="col-6 header-right">
                <button className="icon-btn me-4 " onClick={handleBackClick}>
                  <i class=" text-primary fa-solid fa-backward"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-danger fa-regular fa-rectangle-xmark"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-success fa-solid fa-briefcase"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-success fa-solid fa-calculator"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-danger fa-solid fa-rotate-left"></i>
                </button>
                <button className="icon-btn me-4 ">
                  <i class=" text-primary fa-regular fa-circle-pause"></i>
                </button>
              </div>
              <div className="col-2">
                <button className=" p-2 rounded-4 " onClick={handleAdExpence}>
                  {" "}
                  Add Expence
                </button>
              </div>
            </header>
          </div>
        </div>
        <div className="card cardHover rounded-4 border-0">
          <div className="card-body">
            <div className="row mb-3 d-flex align-products-center">
              <div className="pos-container">
                <div className="row pos-body">
                  <div className="col-6 pos-left">
                    <div
                      className="search-section mb-3"
                      style={{
                        position: "relative",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center walk-in-customer"
                        style={{ flex: "0 0 33%" }}
                      >
                        <div style={{ flex: 1 }}>
                          <Select
                            id="customer"
                            name="customer"
                            options={customerOptions}
                            value={customerOptions.find(
                              (option) => option.value === customer
                            )}
                            onChange={(selectedOption) =>
                              setCustomer(selectedOption.value)
                            }
                            placeholder="Select a Customer"
                            isSearchable
                            styles={{
                              control: (base, state) => ({
                                ...base,
                                height: "38px",
                                minHeight: "38px",
                                borderRadius: "5px 0 0 5px",
                                borderColor: state.isFocused
                                  ? "#0d6efd"
                                  : "#ced4da",
                                boxShadow: state.isFocused
                                  ? "0 0 0 0.2rem rgba(13, 110, 253, 0.25)"
                                  : "none",
                                "&:hover": { borderColor: "#0d6efd" },
                              }),
                            }}
                          />
                        </div>
                        <button
                          className="btn btn-primary d-flex align-items-center justify-content-center"
                          style={{
                            height: "38px",
                            width: "38px",
                            borderRadius: "0 5px 5px 0",
                            border: "1px solid #0d6efd",
                            backgroundColor: "#0d6efd",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={handleShow}
                        >
                          <FaUserPlus />
                        </button>
                      </div>

                      <Modal show={show} onHide={handleClose} size="lg">
                        <Modal.Header closeButton>
                          <Modal.Title>Add a new contact</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Form onSubmit={handleSubmit}>
                            <div className="mb-3">
                              <Form.Check
                                inline
                                label="Individual"
                                type="radio"
                                name="contactType"
                              />
                              <Form.Check
                                inline
                                label="Business"
                                type="radio"
                                name="contactType"
                              />
                            </div>

                            <Row className="mb-3">
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Contact ID:</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Leave empty to autogenerate"
                                    name="contactId"
                                    value={formData.contactId}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Customer Group:</Form.Label>
                                  <Form.Select
                                    name="customerGroup"
                                    value={formData.customerGroup}
                                    onChange={handleChange}
                                  >
                                    <option>None</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            </Row>

                            <Row className="mb-3">
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Prefix:</Form.Label>
                                  <Form.Select
                                    name="prefix"
                                    value={formData.prefix}
                                    onChange={handleChange}
                                  >
                                    <option>Mr</option>
                                    <option>Mrs</option>
                                    <option>Miss</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>First Name *</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Middle Name</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Last Name</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                            </Row>

                            <Row className="mb-3">
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Mobile *</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>
                                    Alternate contact number
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="altContactNumber"
                                    value={formData.altContactNumber}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Landline</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="landline"
                                    value={formData.landline}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Email</Form.Label>
                                  <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>

                            <Row className="mb-3">
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Date of Birth</Form.Label>
                                  <Form.Control
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Assigned to:</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>

                            <div className="mt-4">
                              <h5>More Informations</h5>
                            </div>

                            <div className="mt-3 d-flex justify-content-end">
                              <Button
                                variant="secondary"
                                onClick={handleClose}
                                className="me-2"
                              >
                                Close
                              </Button>
                              <Button type="submit" variant="primary">
                                Save
                              </Button>
                            </div>
                          </Form>
                        </Modal.Body>
                      </Modal>

                      <div
                        className="search-input"
                        style={{ flex: "1", minWidth: "0", width: "100%" }}
                      >
                        <input
                          type="text"
                          className="form-control rounded-5 p-3"
                          placeholder="Enter Product name / SKU / Scan bar code"
                          value={searchTerm}
                          onChange={handleSearch}
                          style={{ width: "100%" }}
                        />
                      </div>

                      {searchTerm && searchResults.length > 0 && (
                        <div
                          className="search-dropdown"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1000,
                          }}
                        >
                          {searchResults.map((product) => (
                            <div
                              className="product-card"
                              key={product.sku}
                              onClick={() => handleAddedProduct(product)}
                              style={{
                                cursor: "pointer",
                                padding: "10px",
                                display: "flex",
                                alignItems: "center",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              <div
                                className="product-image-container"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  marginRight: "10px",
                                }}
                              >
                                <img
                                  src={`${process.env.REACT_APP_BASE_URL}${product.productImage}`}
                                  alt={product.productName}
                                  className="product-image"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                              <div
                                className="product-info"
                                style={{ fontSize: "14px", fontWeight: "bold" }}
                              >
                                {product.productName}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        flexGrow: 1,
                        maxHeight: "320px",
                        overflowY: "auto",
                      }}
                    >
                      <table className="cart-table table table-borderless">
                        <thead className="border-bottom">
                          <tr>
                            <th className="w-40">Product</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-center">Price inc. tax</th>
                            <th className="text-center">Subtotal</th>
                            <th className="text-center">Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducts.map((product) => (
                            <tr
                              key={`${product.sku}-${product.variationId}`}
                              className="align-middle"
                            >
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-bold">
                                    {product.productName}
                                  </span>
                                  <div className="text-muted small">
                                    <span>{product.sku}</span>
                                    {product.variationName && (
                                      <span>
                                        {" "}
                                        - {product.variationName} (
                                        {product.variationValue})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-success small">
                                    50.00 Pc(s) in stock
                                  </span>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex align-products-center justify-content-center">
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-circle p-0 d-flex align-products-center justify-content-center"
                                    style={{ width: "28px", height: "28px" }}
                                    onClick={() =>
                                      handleQuantityChange(
                                        product,
                                        product.quantity - 1
                                      )
                                    }
                                    disabled={product.quantity === 1}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    className="form-control text-center mx-2"
                                    style={{ width: "60px" }}
                                    value={product.quantity}
                                    min="1"
                                    onChange={(e) => {
                                      const value = Math.max(
                                        1,
                                        parseInt(e.target.value) || 1
                                      );
                                      handleQuantityChange(product, value);
                                    }}
                                  />
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-circle p-0 d-flex align-products-center justify-content-center"
                                    style={{ width: "28px", height: "28px" }}
                                    onClick={() =>
                                      handleQuantityChange(
                                        product,
                                        product.quantity + 1
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="text-center">
                                $
                                {product.productSellingPrice
                                  ? product.productSellingPrice.toFixed(2)
                                  : "0.00"}{" "}
                                <br />
                              </td>
                              <td className="text-center">
                                ${(product.subtotal || 0).toFixed(2)}
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-link text-danger p-0"
                                  onClick={() => handleRemoveFromCart(product)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="totals-section row mt-4 g-3">
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Items:</span>
                          <span className="fw-bold">{totals.products}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Total:</span>
                          <span className="fw-bold">
                            ${totals.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Discount</span>
                          <input
                            type="number"
                            className="form-control"
                            value={totals.discount}
                            onChange={(e) =>
                              handleTotalsChange(
                                "discount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEditClick("discount")}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Order Tax</span>
                          <input
                            type="number"
                            className="form-control"
                            value={totals.orderTax}
                            onChange={(e) =>
                              handleTotalsChange(
                                "orderTax",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEditClick("orderTax")}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Shipping</span>
                          <input
                            type="number"
                            className="form-control"
                            value={totals.shipping}
                            onChange={(e) =>
                              handleTotalsChange(
                                "shipping",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEditClick("shipping")}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      </div>

                      <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                          <Modal.Title>
                            Edit{" "}
                            {fieldToEdit.charAt(0).toUpperCase() +
                              fieldToEdit.slice(1)}
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          {fieldToEdit === "discount" && (
                            <>
                              <div className="mb-3">
                                <label
                                  htmlFor="discountType"
                                  className="form-label"
                                >
                                  Discount Type:
                                </label>
                                <Dropdown onSelect={(e) => setDiscountType(e)}>
                                  <Dropdown.Toggle
                                    variant="success"
                                    id="dropdown-basic"
                                  >
                                    {discountType || "Select Type"}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item eventKey="Percentage">
                                      Percentage
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="Fixed">
                                      Fixed Amount
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                              {discountType === "Percentage" && (
                                <div className="mb-3">
                                  <label
                                    htmlFor="discountAmount"
                                    className="form-label"
                                  >
                                    Discount Percentage:
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={discountAmount}
                                    onChange={(e) =>
                                      setDiscountAmount(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>
                              )}
                              {discountType === "Fixed" && (
                                <div className="mb-3">
                                  <label
                                    htmlFor="discountAmount"
                                    className="form-label"
                                  >
                                    Discount Amount:
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={discountAmount}
                                    onChange={(e) =>
                                      setDiscountAmount(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </>
                          )}
                          {fieldToEdit === "orderTax" && (
                            <div className="mb-3">
                              <label htmlFor="orderTax" className="form-label">
                                Order Tax:
                              </label>
                              <Dropdown onSelect={(e) => setOrderTaxType(e)}>
                                <Dropdown.Toggle
                                  variant="success"
                                  id="dropdown-tax-type"
                                >
                                  {orderTaxType || "Select Tax Type"}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item eventKey="VAT">
                                    VAT @10%
                                  </Dropdown.Item>
                                  <Dropdown.Item eventKey="GST">
                                    GST @18%
                                  </Dropdown.Item>
                                  <Dropdown.Item eventKey="CGST">
                                    CGST @10%
                                  </Dropdown.Item>
                                  <Dropdown.Item eventKey="SGST">
                                    SGST @8%
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          )}
                          {fieldToEdit === "shipping" && (
                            <div className="mb-3">
                              <label htmlFor="shipping" className="form-label">
                                Shipping:
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                value={shipping}
                                onChange={(e) =>
                                  setShipping(parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                          )}
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            variant="secondary"
                            onClick={handleCloseModal}
                          >
                            Close
                          </Button>
                          <Button variant="primary" onClick={handleSaveChanges}>
                            Save Changes
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </div>
                  </div>
                  <div className="col-6 pos-right">
                    <div className="container mx-auto p-4">
                      <div className="row mb-4">
                        <div className="col-6">
                          <Button
                            variant="primary"
                            onClick={() => setShowCategoryModal(true)}
                            className="custom-btn"
                          >
                            <i className="fas fa-th mr-2"></i> Categories
                          </Button>
                        </div>
                        <div className="col-6">
                          <Button
                            variant="primary"
                            onClick={() => setShowBrandModal(true)}
                            className="custom-btn"
                          >
                            <i className="fas fa-tag mr-2"></i> Brands
                          </Button>
                        </div>
                      </div>
                      {showCategoryModal && (
                        <div className="modal-overlay">
                          <div className="modal-content-right">
                            <div className="modal-header">
                              <h3 className="modal-title">Categories</h3>
                              <button
                                className="close-btn"
                                onClick={() => setShowCategoryModal(false)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="modal-body">
                              <div className="category-grid-container">
                                <button
                                  className="category-item all-categories"
                                  onClick={() => handleCategorySelect(null)}
                                >
                                  All Categories
                                </button>
                                {categories.length > 0 ? (
                                  categories.map((category) => (
                                    <button
                                      key={category.id}
                                      className="category-item"
                                      onClick={() =>
                                        handleCategorySelect(category)
                                      }
                                    >
                                      {category.categoryName}
                                    </button>
                                  ))
                                ) : (
                                  <p className="no-data">
                                    No categories available
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {showBrandModal && (
                        <div className="modal-overlay">
                          <div className="modal-content-right">
                            <div className="modal-header">
                              <h3 className="modal-title">Brands</h3>
                              <button
                                className="close-btn"
                                onClick={() => setShowBrandModal(false)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="modal-body">
                              <div className="grid-container">
                                <button
                                  className="brand-item all-brands"
                                  onClick={() => handleBrandSelect(null)}
                                >
                                  All Brands
                                </button>
                                {brands.length > 0 ? (
                                  brands.map((brand) => (
                                    <button
                                      key={brand.id}
                                      className="brand-item"
                                      onClick={() => handleBrandSelect(brand)}
                                    >
                                      {brand.brandName}
                                    </button>
                                  ))
                                ) : (
                                  <p className="no-data">No brands available</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="product-grid">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <div
                              className="product-card"
                              key={product.sku}
                              onClick={() => handleAddProduct(product)}
                            >
                              <div className="product-image-container">
                                <img
                                  src={`${process.env.REACT_APP_BASE_URL}${product.productImage}`}
                                  alt={product.productName}
                                  className="product-image"
                                />
                              </div>
                              <div className="product-info">
                                <div>{product.productName}</div>
                                <div>
                                  Stock: {product.productVariations.length}
                                </div>
                                <div>
                                  Price:{" "}
                                  {(
                                    product.productVariations[0]
                                      ?.defaultSellingPrice || 0
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>
                            No products available for this category or brand
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card cardHover rounded-4 border-0 ">
          <div className="card-body">
            <footer className="pos-footer row justify-content-between align-items-center p-3">
              <div className="footer-left col-2 d-flex flex-column">
                <div className="footer-left col-3 d-flex flex-column">
                  <div className="footer-buttons d-flex gap-3 mb-2">
                    <button
                      className="footer-btn d-flex align-items-center"
                      style={{ padding: "5px 10px", fontSize: "12px" }}
                    >
                      <i
                        className="text-info fa-solid fa-briefcase"
                        style={{ fontSize: "16px" }}
                      ></i>
                      <span className="ms-2">Credit Sale</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 col-3">
                <Button className="bg-dark text-light px-4" onClick={openModal}>
                  <i className="fa-solid fa-money-check me-2"></i> Multiple Pay
                </Button>
                <Button className="bg-success text-light px-4">
                  <i className="fa-solid fa-money-bill me-2"></i> Submit
                </Button>
                <Button
                  className="bg-danger text-light px-4"
                  onClick={handleCancel}
                >
                  <i className="fa-solid fa-xmark me-2"></i> Cancel
                </Button>
              </div>

              <div className="footer-right col-2 text-end">
                <div className="total-payable">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fs-4 text-success ms-2">
                    {(
                      (totals?.total || 0) -
                      (totals?.discount || 0) +
                      (totals?.orderTax || 0) +
                      (totals?.shipping || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="col-2 text-end">
                <div>
                  <Button
                    className="bg-primary text-light px-4"
                    onClick={() => setShowTModal(true)}
                  >
                    <i className="fa-solid fa-clock me-2"></i> Recent
                    Transactions
                  </Button>

                  {/* Modal */}
                  <Modal
                    show={showTModal}
                    onHide={() => setShowTModal(false)}
                    size="lg"
                    centered
                    fullscreen="lg-down"
                    dialogClassName="recent-transactions-modal"
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Recent Transactions</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="table-responsive mt-3">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Customer</th>
                              <th>Amount</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactionsData.length > 0 ? (
                              transactionsData.map((txn, index) => (
                                <tr key={txn.id}>
                                  <td>{index + 1}</td>
                                  <td>{txn.customer || "N/A"}</td>{" "}
                                  <td>
                                    $
                                    {txn.shippingCharges
                                      ? txn.shippingCharges.toFixed(2)
                                      : "0.00"}
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                    >
                                      <i className="fa-solid fa-pen"></i> Edit
                                    </Button>
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      className="me-2"
                                    >
                                      <i className="fa-solid fa-print"></i>{" "}
                                      Print
                                    </Button>
                                    <Button variant="outline-danger" size="sm">
                                      <i className="fa-solid fa-trash"></i>{" "}
                                      Delete
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No transactions found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Modal.Body>
                  </Modal>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
      <div
        className={`modal fade ${isModalVisible ? "show d-block" : ""}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-dark text-light">
              <h5 className="modal-title">Multiple Payment</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeModal}
              ></button>
            </div>

            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Advance Balance:</label>
                  <div className="form-control">$ 0.00</div>
                </div>
              </div>

              {paymentRows.map((row, index) => (
                <div className="row mb-3" key={index}>
                  <div className="col-md-4">
                    <label>Amount:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={row.amount}
                      onChange={(e) =>
                        updatePaymentRow(index, "amount", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Payment Method:</label>
                    <select
                      className="form-select"
                      value={row.method}
                      onChange={(e) =>
                        updatePaymentRow(index, "method", e.target.value)
                      }
                    >
                      <option>Cash</option>
                      <option>Credit Card</option>
                      <option>Check</option>
                      <option>Gift Card</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label>Payment Account:</label>
                    <select
                      className="form-select"
                      value={row.account}
                      onChange={(e) =>
                        updatePaymentRow(index, "account", e.target.value)
                      }
                    >
                      <option>None</option>
                      <option>Account 1</option>
                      <option>Account 2</option>
                    </select>
                  </div>
                </div>
              ))}

              <button className="btn btn-link mb-3" onClick={addPaymentRow}>
                <i className="fa-solid fa-plus me-2"></i>Add Payment Row
              </button>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Sell note:</label>
                  <textarea
                    className="form-control"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label>Staff note:</label>
                  <textarea
                    className="form-control"
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Payable:</span>
                    <span>${totalPayable.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Paying:</span>
                    <span>${totalPaying.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Change Return:</span>
                    <span>${changeReturn.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Balance:</span>
                    <span>${balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleFinalizePayment}
              >
                Finalize Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;
