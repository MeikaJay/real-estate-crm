import { useState } from "react";
import { supabase } from "./supabase";
import { Link } from "react-router-dom";
import "./App.css";

function LeadFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    timeline: "",
    hasRealtor: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supabase) {
      alert("Supabase is not connected yet.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("Leads").insert([
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        timeline: formData.timeline,
        has_realtor: formData.hasRealtor,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(`Something went wrong: ${error.message}`);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="thank-you-page">
        <div className="thank-you-card">
          <h1>Thank You</h1>
          <p>
            Your request has been received. A real estate professional will be
            reaching out to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="overlay">
        <div className="card">
          <p className="eyebrow">Euphoria Realty</p>
          <h1>Thank You for Touring</h1>
          <p className="intro">
            Complete the form below and a real estate professional will reach
            out to you.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>First Name</label>
              <input
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Last Name</label>
              <input
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>How soon are you looking to purchase?</label>
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
              >
                <option value="">Select one</option>
                <option value="Immediately">Immediately</option>
                <option value="1 to 3 months">1 to 3 months</option>
                <option value="3 to 6 months">3 to 6 months</option>
                <option value="6+ months">6+ months</option>
                <option value="Just browsing">Just browsing</option>
              </select>
            </div>

            <div className="field">
              <label>Are you already working with a realtor?</label>
              <select
                name="hasRealtor"
                value={formData.hasRealtor}
                onChange={handleChange}
                required
              >
                <option value="">Select one</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Request A Callback"}
            </button>
          </form>

          <div className="agent-login-wrap">
            <Link to="/login" className="agent-login-link">
              Realtor Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadFormPage;