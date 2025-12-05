import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/plugins/fontawesome-free/css/all.min.css";
import "../../assets/plugins/daterangepicker/daterangepicker.css";
import "../../assets/plugins/icheck-bootstrap/icheck-bootstrap.min.css";
import "../../assets/plugins/bootstrap-colorpicker/css/bootstrap-colorpicker.min.css";
import "../../assets/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css";
import "../../assets/plugins/select2/css/select2.min.css";
import "../../assets/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css";
import "../../assets/plugins/bootstrap4-duallistbox/bootstrap-duallistbox.min.css";
import "../../assets/plugins/bs-stepper/css/bs-stepper.min.css";
import "../../assets/plugins/dropzone/min/dropzone.min.css";
import "../../assets/dist/css/adminlte.min.css";
import "../AddUser.css";
import axios from "axios"; // For making API requests

const EditVendorInfo = () => {
  // State hooks for form fields
  const [vendorType, setVendorType] = useState("");
  const [vendorFor, setVendorFor] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [firmName, setFirmName] = useState("");
  const [authorityPerson, setAuthorityPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternativeMobileNumber, setAlternativeMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [alternativeAddress, setAlternativeAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [taxOrGstNumber, setTaxOrGstNumber] = useState("");
  const [shopActNumber, setShopActNumber] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [isActive, setIsActive] = useState(false);

  const { id } = useParams(); // Get vendor ID from route parameters
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendorData();
  }, [id]);

  const fetchVendorData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/vendor/${id}`
      );
      if (!response.data) {
        throw new Error("Vendor not found");
      }

      const data = response.data;

      // Set the states correctly based on the data structure from API response
      setVendorType(data.vendorType || "");
      setVendorFor(data.vendorFor || "");
      setVendorId(data.vendorId || "");
      setFirmName(data.firmName || "");
      setAuthorityPerson(data.authorityPerson || "");
      setEmail(data.email || "");
      setPassword(data.password || "");
      setMobileNumber(data.mobileNumber || "");
      setAlternativeMobileNumber(data.alternativeMobileNumber || "");
      setAddress(data.address || "");
      setAlternativeAddress(data.alternativeAddress || "");
      setCity(data.city || "");
      setState(data.state || "");
      setCountry(data.country || "");
      setZipCode(data.zipCode || "");
      setTaxOrGstNumber(data.taxOrGstNumber || "");
      setShopActNumber(data.shopActNumber || "");
      setCinNumber(data.cinNumber || "");
      setPanNumber(data.panNumber || "");
      setIsActive(data.isActive || false);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedVendor = {
        id,
        vendorType,
        vendorFor,
        vendorId,
        firmName,
        authorityPerson,
        email,
        password,
        mobileNumber,
        alternativeMobileNumber,
        address,
        alternativeAddress,
        city,
        state,
        country,
        zipCode,
        taxOrGstNumber,
        shopActNumber,
        cinNumber,
        panNumber,
        isActive,
      };

      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/vendor/update/${id}`,
        updatedVendor
      );
      navigate("/Profile"); // Navigate back to the vendors list after successful edit
    } catch (error) {
      console.error("Error updating vendor:", error);
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setIsActive(checked);
    } else {
      switch (name) {
        case "vendorType":
          setVendorType(value);
          break;
        case "vendorFor":
          setVendorFor(value);
          break;
        case "vendorId":
          setVendorId(value);
          break;
        case "firmName":
          setFirmName(value);
          break;
        case "authorityPerson":
          setAuthorityPerson(value);
          break;
        case "email":
          setEmail(value);
          break;
        case "password":
          setPassword(value);
          break;
        case "mobileNumber":
          setMobileNumber(value);
          break;
        case "alternativeMobileNumber":
          setAlternativeMobileNumber(value);
          break;
        case "address":
          setAddress(value);
          break;
        case "alternativeAddress":
          setAlternativeAddress(value);
          break;
        case "city":
          setCity(value);
          break;
        case "state":
          setState(value);
          break;
        case "country":
          setCountry(value);
          break;
        case "zipCode":
          setZipCode(value);
          break;
        case "taxOrGstNumber":
          setTaxOrGstNumber(value);
          break;
        case "shopActNumber":
          setShopActNumber(value);
          break;
        case "cinNumber":
          setCinNumber(value);
          break;
        case "panNumber":
          setPanNumber(value);
          break;
        default:
          break;
      }
    }
  };

  const [selectedOption, setSelectedOption] = useState("");

  const handleChangeChecked = (event) => {
    setSelectedOption(event.target.value);
    setVendorFor(event.target.value); // Update vendorFor state on radio change
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        {/* Page Header */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="all-heading ">Edit Vendor</h1>
              </div>
            </div>
          </div>
        </section>

        {/* Form Content */}
        <section className="content">
          <div className="container-fluid">
            <form onSubmit={handleSubmit}>
              <div className="card card-default rounded-4 border-0 cardHover">
                <div className="card-body">
                  {/* Vendor Information */}
                  <div className="d-flex">
                    <div className="row col-12 ">
                      {/* Vendor Type */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="vendorName" className="lb_name">
                            Vendor Type<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-user"></i>
                            </span>
                            <div className="d-flex align-items-center w-100">
                              <select
                                className="form-control"
                                id="vendorType"
                                name="vendorType"
                                value={vendorType}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Please Select</option>
                                <option value="Suppliers">Suppliers</option>
                                <option value="Customers">Customers</option>
                                <option value="Both(Suppliers and Customers)">
                                  Both (Suppliers and Customers)
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Vendor ID */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="vendorAuthorityPerson"
                            className="lb_name"
                          >
                            Vendor ID<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-id-badge"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="vendorId"
                              name="vendorId"
                              value={vendorId}
                              onChange={handleChange}
                              placeholder="Vendor Id"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Vendor Firm Name */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="vendorName" className="lb_name">
                            Vendor Firm Name
                            <span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span
                              className="input_group_addon "
                              id="vendor_input_logo_span"
                            >
                              <i className="fa-solid fa-user-large  " id=""></i>
                            </span>
                            <input
                              disabled
                              type="text"
                              className="form-control"
                              id="firmName"
                              name="firmName"
                              value={firmName}
                              onChange={handleChange}
                              placeholder="Vendor Firm Name"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Vendor Authority Person */}
                      <div className="col-lg-4 ">
                        <div className="form-group">
                          <label
                            htmlFor="vendorAuthorityPerson"
                            className="lb_name"
                          >
                            Vendor Authority Person
                            <span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-user"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="authorityPerson"
                              name="authorityPerson"
                              value={authorityPerson}
                              onChange={handleChange}
                              placeholder="Vendor Authority Person"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* email */}
                      <div className="col-lg-4 ">
                        <div className="form-group">
                          <label htmlFor="email" className="lb_name">
                            E-mail<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-envelope"></i>
                            </span>
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              name="email"
                              value={email}
                              onChange={handleChange}
                              placeholder="Enter Email"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Password */}
                      <div className="col-lg-4 ">
                        <div className="form-group">
                          <label htmlFor="password" className="lb_name">
                            Password<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i class="fa-solid fa-lock"></i>
                            </span>
                            <input
                              type="password"
                              className="form-control"
                              id="password"
                              name="password"
                              value={password}
                              onChange={handleChange}
                              placeholder="Enter Password"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Mobile Number */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="mobileNumber" className="lb_name">
                            Mobile Number<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-mobile"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="mobileNumber"
                              name="mobileNumber"
                              value={mobileNumber}
                              onChange={handleChange}
                              placeholder="Enter Mobile Number"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Alternative Mobile Number */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="mobileNumber" className="lb_name">
                            Alternative Mobile Number
                            <span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-mobile"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="alternativeMobileNumber"
                              name="alternativeMobileNumber"
                              value={alternativeMobileNumber}
                              onChange={handleChange}
                              placeholder="Alternative Mobile Number"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Address */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="address" className="lb_name">
                            Address<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fas fa-address-card"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="address"
                              name="address"
                              value={address}
                              onChange={handleChange}
                              placeholder="Enter Address"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Alternative Address */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="address" className="lb_name">
                            Alternative Address
                            <span className="text-danger"></span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fas fa-address-card"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="alternativeAddress"
                              name="alternativeAddress"
                              value={alternativeAddress}
                              onChange={handleChange}
                              placeholder="Enter Alternative Address"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Country */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="country" className="lb_name">
                            Country<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-globe"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="country"
                              name="country"
                              value={country}
                              onChange={handleChange}
                              placeholder="Enter Country"
                              required
                            />
                          </div>
                        </div>
                      </div>{" "}
                      {/* State */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="state" className="lb_name">
                            State<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-map-marker"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="state"
                              name="state"
                              value={state}
                              onChange={handleChange}
                              placeholder="Enter State"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* city */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="city" className="lb_name">
                            City<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon ">
                              <i className="fa fa-map-marker"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="city"
                              name="city"
                              value={city}
                              onChange={handleChange}
                              placeholder="Enter City"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Zip Code */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="zipCode" className="lb_name">
                            Zip Code<span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-map-marker"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="zipCode"
                              name="zipCode"
                              value={zipCode}
                              onChange={handleChange}
                              placeholder="Enter Zip Code"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Tax / GST Number */}
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label htmlFor="taxNumber" className="lb_name">
                            Tax / GST Number
                            <span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <span className="input_group_addon">
                              <i className="fa fa-info"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              id="taxOrGstNumber"
                              name="taxOrGstNumber"
                              value={taxOrGstNumber}
                              onChange={handleChange}
                              placeholder="Enter Tax / GST Number"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      {/* Individual Radio Button */}
                      {vendorFor === "Individual" && (
                        <div className="col-lg-4 col-12 ">
                          <div className="form-group">
                            <label htmlFor="shopActNumber" className="lb_name">
                              Shop Act Number
                              <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex align-items-center">
                              <span className="input_group_addon">
                                <i className="fa fa-info"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                id="shopActNumber"
                                name="shopActNumber"
                                value={shopActNumber}
                                onChange={handleChange}
                                placeholder="Shop Act Number"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Busness Radio Button */}
                      {vendorFor === "Business" && (
                        <div className="col-lg-4 col-12">
                          <div className="form-group">
                            <label htmlFor="cinNumber" className="lb_name">
                              CIN number<span className="text-danger">*</span>
                            </label>
                            <div className="d-flex align-items-center">
                              <span className="input_group_addon">
                                <i className="fa fa-info"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                id="cinNumber"
                                name="cinNumber"
                                value={cinNumber}
                                onChange={handleChange}
                                placeholder=" CIN number"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Busness Radio Button */}
                      {vendorFor === "Business" && (
                        <div className="col-lg-4 col-12">
                          <div className="form-group">
                            <label htmlFor="panNumber" className="lb_name">
                              Pan number<span className="text-danger">*</span>
                            </label>
                            <div className="d-flex align-items-center">
                              <span className="input_group_addon">
                                <i className="fa fa-info"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                id="panNumber"
                                name="panNumber"
                                value={panNumber}
                                onChange={handleChange}
                                placeholder=" Pan number"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Checkbox */}
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-check form-check-lg">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isActive"
                          name="isActive"
                          checked={isActive}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Is Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="container-fluid text-center mt-3">
                <button
                  type="submit"
                  className="btn btn-save btn-lg px-4 py-2 m-2"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditVendorInfo;
