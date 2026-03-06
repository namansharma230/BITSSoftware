document.getElementById('reportForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Ensure unfair_means is always an array
  data.unfair_means = formData.getAll("unfair_means");

  // Handle checkbox explicitly to ensure boolean
  data.evidence_collected = formData.get("evidence_collected") === "on" ? true : false;
  console.log("evidence_collected:", data.evidence_collected, "type:", typeof data.evidence_collected);

  // Generate unique ID
  data.id = Date.now();

  // Convert date fields
  if (data.exam_date) {
    data.exam_date = new Date(data.exam_date).toISOString().split('T')[0];
  }
  if (data.report_date) {
    data.report_date = new Date(data.report_date).toISOString().split('T')[0];
  }
  if (data.incident_datetime) {
    data.incident_datetime = new Date(data.incident_datetime).toISOString();
  }

  // Log the entire payload for debugging
  console.log("Payload:", JSON.stringify(data));

  try {
    // Use dynamic API URL based on environment
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://bits-ufm-backend.onrender.com';

    const response = await fetch(`${API_BASE_URL}/submit-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("Report submitted successfully!");
      this.reset();
    } else {
      const error = await response.json();
      console.error("Server error:", error);
      alert(`Failed to submit report: ${error.detail || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Network error: " + error.message);
  }
});