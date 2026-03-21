import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import "./App.css";

function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const navigate = useNavigate();

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

      const leadsWithState = (data || []).map((lead) => ({
        ...lead,
        isDirty: false,
        isSaving: false,
      }));

      setLeads(leadsWithState);
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
  }, []);

  const handleFieldChange = (id, field, value) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id
          ? { ...lead, [field]: value, isDirty: true }
          : lead
      )
    );
  };

  const saveLead = async (lead) => {
    setLeads((prevLeads) =>
      prevLeads.map((item) =>
        item.id === lead.id ? { ...item, isSaving: true } : item
      )
    );

    const payload = {
      status: lead.status || "New",
      priority: lead.priority || "Normal",
      notes: lead.notes || "",
    };

    const { error } = await supabase
      .from("Leads")
      .update(payload)
      .eq("id", lead.id);

    if (error) {
      console.error("Error saving lead:", error);
      alert("Could not save lead");
      setLeads((prevLeads) =>
        prevLeads.map((item) =>
          item.id === lead.id ? { ...item, isSaving: false } : item
        )
      );
      return;
    }

    setLeads((prevLeads) =>
      prevLeads.map((item) =>
        item.id === lead.id
          ? {
              ...item,
              ...payload,
              isDirty: false,
              isSaving: false,
            }
          : item
      )
    );
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
              isDirty: false,
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
          {/* HEADER */}
          <div className="dashboard-topbar">
            <div>
              <p className="eyebrow">Private CRM Dashboard</p>
              <h1>Lead Dashboard</h1>
              <p className="intro">
                View incoming leads, update their status, and stay organized.
              </p>
            </div>

            <div className="topbar-buttons">
              <button
                className="small-btn"
                onClick={() => navigate("/")}
              >
                Add Lead
              </button>

              <button className="small-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {/* CONTENT */}
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

                      {/* STATUS */}
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

                      {/* PRIORITY */}
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

                      {/* NOTES */}
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

                      {/* LAST CONTACTED */}
                      <td>
                        {lead.last_contacted
                          ? new Date(lead.last_contacted).toLocaleString()
                          : "Not contacted"}
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="action-buttons">
                          <button
                            className="small-btn"
                            onClick={() => saveLead(lead)}
                            disabled={!lead.isDirty || lead.isSaving}
                          >
                            {lead.isSaving ? "Saving..." : "Save"}
                          </button>

                          <button
                            className="small-btn"
                            onClick={() => submitted(lead.id)}
                          >
                            Submitted
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