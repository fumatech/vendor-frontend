import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VendorProfile = () => {
  const [userData, setUserData] = useState({
    id: "",
    prefix: "Mr",
    firstname: "",
    lastname: "",
    email: "",
    language: "en",
    dateOfBirth: "",
    gender: "",
    isActive: "",
    maritalStatus: "",
    bloodGroup: "",
    mobileNumber: "",
    alternateContactNumber: "",
    familyContactNumber: "",
    facebookLink: "",
    twitterLink: "",
    socialMedia1: "",
    socialMedia2: "",
    customField1: "",
    customField2: "",
    customField3: "",
    customField4: "",
    guardianName: "",
    idProofName: "",
    idProofNumber: "",
    permanentAddress: "",
    currentAddress: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    vendorId: "",
    firmName: "",
    shopActNumber: "",
    cinNumber: "",
    taxOrGstNumber: "",
    panNumber: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      ifsc: "",
      branch: "",
      taxPayerId: ""
    },
    roles: [],
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");
        if (!email) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/vendor/getall`
        );
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        console.log(data);
        const vendor = data.find((vendor) => vendor.email === email);

        if (!vendor) throw new Error("Vendor not found");

        setUserData({
          ...userData,
          id: vendor.id || "",
          prefix: vendor.prefix || "Mr",
          firstname: vendor.firstname || "",
          lastname: vendor.lastname || "",
          email: vendor.email || "",
          password: vendor.password || "",
          language: vendor.language || "en",
          dateOfBirth: vendor.dateOfBirth || "",
          gender: vendor.gender || "",
          isActive: vendor.isActive || "",
          maritalStatus: vendor.maritalStatus || "",
          bloodGroup: vendor.bloodGroup || "",
          mobileNumber: vendor.mobileNumber || "",
          alternateContactNumber: vendor.alternateContactNumber || "",
          familyContactNumber: vendor.familyContactNumber || "",
          facebookLink: vendor.facebookLink || "",
          twitterLink: vendor.twitterLink || "",
          socialMedia1: vendor.socialMedia1 || "",
          socialMedia2: vendor.socialMedia2 || "",
          customField1: vendor.customField1 || "",
          customField2: vendor.customField2 || "",
          customField3: vendor.customField3 || "",
          customField4: vendor.customField4 || "",
          guardianName: vendor.guardianName || "",
          idProofName: vendor.idProofName || "",
          idProofNumber: vendor.idProofNumber || "",
          permanentAddress: vendor.permanentAddress || "",
          currentAddress: vendor.currentAddress || "",
          country: vendor.country || "",
          state: vendor.state || "",
          city: vendor.city || "",
          zipCode: vendor.zipCode || "",
          vendorId: vendor.vendorId || "",
          firmName: vendor.firmName || "",
          shopActNumber: vendor.shopActNumber || "",
          cinNumber: vendor.cinNumber || "",
          taxOrGstNumber: vendor.taxOrGstNumber || "",
          panNumber: vendor.panNumber || "",
          bankDetails: {
            accountHolderName: vendor.accountHolderName || "",
            accountNumber: vendor.accountNumber || "",
            bankName: vendor.bankName || "",
            ifsc: vendor.ifsc || "",
            branch: vendor.branch || "",
            taxPayerId: vendor.taxPayerId || ""
          },
          roles: vendor.roles || [],
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords don't match");
      return;
    }

    try {
      // First verify current password
      const authResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/vendor/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            password: passwordData.current_password,
          }),
        }
      );

      if (!authResponse.ok) {
        alert("Current password is incorrect");
        return;
      }

      // Update password
      const updateResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/vendor/update/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...userData,
            password: passwordData.new_password,
          }),
        }
      );

      if (updateResponse.ok) {
        alert("Password changed successfully");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        throw new Error("Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert(error.message || "Failed to change password");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-md-6">
                <h1 className="all-heading">My Profile</h1>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body">
                    <div className="box-header">
                      <h3 className="box-title">Change Password</h3>
                    </div>
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="form-group row mb-3">
                        <label
                          htmlFor="current_password"
                          className="col-sm-3 col-form-label"
                        >
                          Current password:
                        </label>
                        <div className="col-sm-9">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-lock"></i>
                            </span>
                            <input
                              className="form-control"
                              placeholder="Current password"
                              required
                              name="current_password"
                              type="password"
                              id="current_password"
                              value={passwordData.current_password}
                              onChange={handlePasswordChange}
                              aria-required="true"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label
                          htmlFor="new_password"
                          className="col-sm-3 col-form-label"
                        >
                          New password:
                        </label>
                        <div className="col-sm-9">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-lock"></i>
                            </span>
                            <input
                              className="form-control"
                              placeholder="New password"
                              required
                              name="new_password"
                              type="password"
                              id="new_password"
                              value={passwordData.new_password}
                              onChange={handlePasswordChange}
                              aria-required="true"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group row mb-4">
                        <label
                          htmlFor="confirm_password"
                          className="col-sm-3 col-form-label"
                        >
                          Confirm new password:
                        </label>
                        <div className="col-sm-9">
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-lock"></i>
                            </span>
                            <input
                              className="form-control"
                              placeholder="Confirm new password"
                              required
                              name="confirm_password"
                              type="password"
                              id="confirm_password"
                              value={passwordData.confirm_password}
                              onChange={handlePasswordChange}
                              aria-required="true"
                            />
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-save float-end">
                        Update
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body row">
                    <div className="box-header">
                      <h3 className="box-title">Vendor Profile</h3>
                    </div>
                    <form>
                      <div className="row justify-content-between">
                        <div className="col-md-2 mb-3">
                          <label htmlFor="prefix" className="form-label">
                            Prefix:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.prefix || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label htmlFor="firstname" className="form-label">
                            First Name:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.firstname || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label htmlFor="lastname" className="form-label">
                            Last Name:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.lastname || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">
                            Email:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.email || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="language" className="form-label">
                            Language:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-info" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.language || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        {/* Vendor Specific Fields */}
                        <div className="col-md-4 mb-3">
                          <label htmlFor="vendorId" className="form-label">
                            Vendor ID:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-id-card" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.vendorId || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label htmlFor="firmName" className="form-label">
                            Vendor Firm Name:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-building" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.firmName || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label htmlFor="shopActNumber" className="form-label">
                            Shop Act Number:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-file-text" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.shopActNumber || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label htmlFor="cinNumber" className="form-label">
                            CIN Number:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-file-text" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.cinNumber || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label
                            htmlFor="taxOrGstNumber"
                            className="form-label"
                          >
                            Tax/GST Number:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-file-text" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.taxOrGstNumber || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label htmlFor="panNumber" className="form-label">
                            PAN Number:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-file-text" />
                            </span>
                            <input
                              className="form-control"
                              value={userData.panNumber || "N/A"}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* More Informations Section */}
                      <div className="row mt-4">
                        <div className="col-md-12">
                          <div className="box-header">
                            <h3 className="box-title">More Informations</h3>
                          </div>

                          <div className="tw-flow-root tw-border-gray-200">
                            <div className="tw-py-2 tw-align-middle sm:tw-px-5 row">
                              {/* Basic Details */}
                              <div className="form-group col-md-3">
                                <label>Date of birth:</label>
                                <input
                                  className="form-control"
                                  type="text"
                                  value={userData.dateOfBirth || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Gender:</label>
                                <input
                                  className="form-control"
                                  value={userData.gender || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Marital Status:</label>
                                <input
                                  className="form-control"
                                  value={userData.maritalStatus || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Blood Group:</label>
                                <input
                                  className="form-control"
                                  value={userData.bloodGroup || "N/A"}
                                  readOnly
                                />
                              </div>

                              {/* Contact Details */}
                              <div className="form-group col-md-3">
                                <label>Mobile Number:</label>
                                <input
                                  className="form-control"
                                  value={userData.mobileNumber || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Alternate contact number:</label>
                                <input
                                  className="form-control"
                                  value={
                                    userData.alternateContactNumber || "N/A"
                                  }
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Family contact number:</label>
                                <input
                                  className="form-control"
                                  value={userData.familyContactNumber || "N/A"}
                                  readOnly
                                />
                              </div>

                              {/* Social Media */}
                              <div className="form-group col-md-3">
                                <label>Facebook Link:</label>
                                <input
                                  className="form-control"
                                  value={userData.facebookLink || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Twitter Link:</label>
                                <input
                                  className="form-control"
                                  value={userData.twitterLink || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Social Media 1:</label>
                                <input
                                  className="form-control"
                                  value={userData.socialMedia1 || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Social Media 2:</label>
                                <input
                                  className="form-control"
                                  value={userData.socialMedia2 || "N/A"}
                                  readOnly
                                />
                              </div>

                              {/* Custom Fields */}
                              <div className="form-group col-md-3">
                                <label>Custom field 1:</label>
                                <input
                                  className="form-control"
                                  value={userData.customField1 || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Custom field 2:</label>
                                <input
                                  className="form-control"
                                  value={userData.customField2 || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Custom field 3:</label>
                                <input
                                  className="form-control"
                                  value={userData.customField3 || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Custom field 4:</label>
                                <input
                                  className="form-control"
                                  value={userData.customField4 || "N/A"}
                                  readOnly
                                />
                              </div>

                              {/* Identity */}
                              <div className="form-group col-md-3">
                                <label>Guardian Name:</label>
                                <input
                                  className="form-control"
                                  value={userData.guardianName || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>ID proof name:</label>
                                <input
                                  className="form-control"
                                  value={userData.idProofName || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>ID proof number:</label>
                                <input
                                  className="form-control"
                                  value={userData.idProofNumber || "N/A"}
                                  readOnly
                                />
                              </div>

                              {/* Location Fields */}
                              <div className="form-group col-md-3">
                                <label>Country:</label>
                                <input
                                  className="form-control"
                                  value={userData.country || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>State:</label>
                                <input
                                  className="form-control"
                                  value={userData.state || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>City:</label>
                                <input
                                  className="form-control"
                                  value={userData.city || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-3">
                                <label>Zip Code:</label>
                                <input
                                  className="form-control"
                                  value={userData.zipCode || "N/A"}
                                  readOnly
                                />
                              </div>

                              {/* Addresses */}
                              <div className="form-group col-md-6">
                                <label>Permanent Address:</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={userData.permanentAddress || "N/A"}
                                  readOnly
                                />
                              </div>
                              <div className="form-group col-md-6">
                                <label>Current Address:</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={userData.currentAddress || "N/A"}
                                  readOnly
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card card-default rounded-4 border-0 cardHover">
                  <div className="card-body row">
                    {/* Bank Details */}
                    <div className="col-md-12 mt-3">
                      <div className="box-header">
                        <h3 className="box-title">Bank Details:</h3>
                      </div>
                    </div>

                    <div className="form-group col-md-3">
                      <label>Account Holder's Name:</label>
                      <input
                        className="form-control"
                        placeholder="Account Holder's Name"
                        value={userData.bankDetails.accountHolderName || "N/A"}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label>Account Number:</label>
                      <input
                        className="form-control"
                        placeholder="Account Number"
                        value={userData.bankDetails.accountNumber || "N/A"}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label>Bank Name:</label>
                      <input
                        className="form-control"
                        placeholder="Bank Name"
                        value={userData.bankDetails.bankName || "N/A"}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label>
                        Bank Identifier Code:{" "}
                        <i
                          className="fa fa-info-circle text-info"
                          title="A unique code to identify the bank in your country, for example: IFSC code"
                        ></i>
                      </label>
                      <input
                        className="form-control"
                        placeholder="Bank Identifier Code"
                        value={userData.bankDetails.ifsc || "N/A"}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label>Branch:</label>
                      <input
                        className="form-control"
                        placeholder="Branch"
                        value={userData.bankDetails.branch || "N/A"}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label>
                        Tax Payer ID:{" "}
                        <i
                          className="fa fa-info-circle text-info"
                          title="Tax number id of the employee, for example, PAN card in India"
                        ></i>
                      </label>
                      <input
                        className="form-control"
                        placeholder="Tax Payer ID"
                        value={userData.bankDetails.taxPayerId || "N/A"}
                        readOnly
                      />
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

export default VendorProfile;