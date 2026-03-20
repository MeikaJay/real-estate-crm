import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("Leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading leads:", error);
      setLoading(false);
      return;
    }

    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadField = async (id, field, value) => {
    const { error } = await supabase
      .from("Leads")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`Could not update ${field}`);
      return;
    }

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, [field]: value } : lead
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-overlay">
        <div className="dashboard-card">
          <p className="eyebrow">Private CRM Dashboard</p>
          <h1>Lead Dashboard</h1>
          <p className="intro">
            View incoming leads, update their status, and stay organized.
          </p>

          {loading ? (
            <p className="dashboard-message">Loading leads...</p>
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
                      <td>{lead.has_realtor}</td>

                      <td>
                        <select
                          className="dashboard-select"
                          value={lead.status || "New"}
                          onChange={(e) =>
                            updateLeadField(lead.id, "status", e.target.value)
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
                            updateLeadField(lead.id, "priority", e.target.value)
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
                            setLeads((prevLeads) =>
                              prevLeads.map((item) =>
                                item.id === lead.id
                                  ? { ...item, notes: e.target.value }
                                  : item
                              )
                            )
                          }
                          onBlur={(e) =>
                            updateLeadField(lead.id, "notes", e.target.value)
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
                            Mark Called
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