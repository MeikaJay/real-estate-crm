import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import "./App.css";

function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const navigate = useNavigate();
  const saveTimeouts = useRef({});

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setPageError("");

      const { data, error } = await supabase
        .from("Leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading leads:", error);
        setPageError(error.message || "Could not load leads.");
        setLeads([]);
        return;
      }

      setLeads(data || []);
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      setPageError(err.message || "Unexpected error loading leads.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    return () => {
      Object.values(saveTimeouts.current).forEach((timeoutId) =>
        clearTimeout(timeoutId)
      );
    };
  }, []);

  const autoSaveLead = (updatedLead) => {
    if (saveTimeouts.current[updatedLead.id]) {
      clearTimeout(saveTimeouts.current[updatedLead.id]);
    }

    saveTimeouts.current[updatedLead.id] = setTimeout(async () => {
      const payload = {
        status: updatedLead.status || "New",
        priority: updatedLead.priority || "Normal",
        notes: updatedLead.notes || "",
      };

      const { error } = await supabase
        .from("Leads")
        .update(payload)
        .eq("id", updatedLead.id);

      if (error) {
        console.error("Error auto-saving lead:", error);
        alert("Could not save changes");
      }
    }, 700);
  };

  const handleFieldChange = (id, field, value) => {
    setLeads((prevLeads) => {
      const updatedLeads = prevLeads.map((lead) =>
        lead.id === id ? { ...lead, [field]: value } : lead
      );

      const updatedLead = updatedLeads.find((lead) => lead.id === id);
      if (updatedLead) {
        autoSaveLead(updatedLead);
      }

      return updatedLeads;
    });
  };

  const markAsCalled = async (id) => {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("Leads")
      .update({
        status: "Contacted",
        last_contacted: now,
      })
      .eq("id", id);

    if (error) {
      console.error("Error marking as called:", error);
      alert("Could not mark as called");
      return;
    }

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              status: "Contacted",
              last_contacted: now,
            }
          : lead
      )
    );
  };

  const deleteLead = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    const { error } = await supabase.from("Leads").delete().eq("id", id);

    if (error) {
      console.error("Error deleting lead:", error);
      alert("Could not delete lead");
      return;
    }

    setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      alert("Could not log out");
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-overlay">
        <div className="dashboard-card">
          <div className="dashboard-topbar">
            <div>
              <p className="eyebrow">Private CRM Dashboard</p>
              <h1>Lead Dashboard</h1>
              <p className="intro">
                View incoming leads, update their status, and stay organized.
              </p>
            </div>

            <div className="topbar-buttons">
              <button className="small-btn" onClick={() => navigate("/")}>
                Add Lead
              </button>

              <button className="small-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {loading ? (
            <p className="dashboard-message">Loading leads...</p>
          ) : pageError ? (
            <p className="dashboard-message">Error: {pageError}</p>
          ) : leads.length === 0 ? (
            <p className="dashboard-message">No leads yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Timeline</th>
                    <th>Realtor</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Notes</th>
                    <th>Last Contacted</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        {lead.first_name} {lead.last_name}
                      </td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.timeline}</td>
                      <td>{String(lead.has_realtor ?? "")}</td>

                      <td>
                        <select
                          className="dashboard-select"
                          value={lead.status || "New"}
                          onChange={(e) =>
                            handleFieldChange(lead.id, "status", e.target.value)
                          }
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow Up">Follow Up</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td>
                        <select
                          className="dashboard-select"
                          value={lead.priority || "Normal"}
                          onChange={(e) =>
                            handleFieldChange(
                              lead.id,
                              "priority",
                              e.target.value
                            )
                          }
                        >
                          <option value="Low">Low</option>
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                        </select>
                      </td>

                      <td>
                        <textarea
                          className="dashboard-notes"
                          placeholder="Add notes"
                          value={lead.notes || ""}
                          onChange={(e) =>
                            handleFieldChange(lead.id, "notes", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        {lead.last_contacted
                          ? new Date(lead.last_contacted).toLocaleString()
                          : "Not contacted"}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="small-btn"
                            onClick={() => markAsCalled(lead.id)}
                          >
                            Submit
                          </button>

                          <button
                            className="small-btn delete-btn"
                            onClick={() => deleteLead(lead.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;