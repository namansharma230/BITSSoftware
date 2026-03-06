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
  data.id = String(Date.now());

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
    await window.SupabaseClient.insertReport(data);
    alert("Report submitted successfully!");
    this.reset();
  } catch (error) {
    console.error("Supabase error:", error);
    alert("Failed to submit report: " + (error.message || 'Unknown error'));
  }
});