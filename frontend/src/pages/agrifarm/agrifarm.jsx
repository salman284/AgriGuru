import React, { useState } from "react";
import { Link } from "react-router-dom";
import './agrifarm.css'; // Import your CSS for styling

const AgrifarmForm = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    landAmount: "",
    skills: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you can send form data to backend API
  };

  const landAmountNum = parseFloat(form.landAmount) || 0;
  const yearlyPay = landAmountNum * 500;
  const totalPay = yearlyPay * 5;

  return (
    <div className="agrifarm-flex-wrapper">
      <div className="agrifarm-form-container">
        <h2>AgriFarm Land Contract Form</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name:<br />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <br /><br />
          <label>
            Address:<br />
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>
          <br /><br />
          <label>
            Amount of Land (in Satak):<br />
            <input
              type="number"
              name="landAmount"
              value={form.landAmount}
              onChange={handleChange}
              min="1"
              required
            />
          </label>
          <br /><br />
          <label>
            Skills you have:<br />
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g. Tractor driving, irrigation, pest control"
            />
          </label>
          <br /><br />
          <button type="submit">Submit Contract</button>
        </form>
      </div>
      {submitted && (
        <div className="contract-summary contract-summary-side">
          <h3>Contract Summary</h3>
          <p><strong>Name:</strong> {form.name}</p>
          <p><strong>Address:</strong> {form.address}</p>
          <p><strong>Land Provided:</strong> {form.landAmount} Satak</p>
          <p><strong>Skills:</strong> {form.skills || "Not specified"}</p>
          <p><strong>Annual Pay:</strong> ₹{yearlyPay}</p>
          <p><strong>Total Pay (5 years):</strong> ₹{totalPay}</p>
          <p><strong>Contract Duration:</strong> 5 Years</p>
          <p><strong>Training:</strong> Will be provided by company</p>
          <p><strong>Wages:</strong> Allocated as per company policy</p>
          <p><strong>Employment Status:</strong> Employed by company</p>
        </div>
      )}
    </div>
  );
};

export default AgrifarmForm;