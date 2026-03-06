// ============================================================
// Supabase Client — Direct frontend-to-Supabase communication
// ============================================================

const SUPABASE_URL = 'https://dyhuotgpgrjoklkpxmhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5aHVvdGdwZ3Jqb2tsa3B4bWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTA4OTAsImV4cCI6MjA4ODM2Njg5MH0.bvXaRKKL18WJndfRGdRXCJnNTdDo6wNc-ICNejrMcOY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Sentiment Analysis (JS port of Python keyword matcher) ----

const POSITIVE_WORDS = ['good', 'great', 'excellent', 'positive', 'happy', 'resolved', 'success', 'helpful'];
const NEGATIVE_WORDS = ['bad', 'poor', 'terrible', 'negative', 'unhappy', 'issue', 'problem', 'fail', 'cheating', 'impersonation', 'severe'];

function analyzeSentiment(text) {
    if (!text) return 'neutral';
    const lower = text.toLowerCase();
    let pos = 0, neg = 0;
    POSITIVE_WORDS.forEach(w => { if (new RegExp('\\b' + w + '\\b').test(lower)) pos++; });
    NEGATIVE_WORDS.forEach(w => { if (new RegExp('\\b' + w + '\\b').test(lower)) neg++; });
    if (neg > pos) return 'negative';
    if (pos > neg) return 'positive';
    return 'neutral';
}

// ---- Database Helpers ----

async function fetchAllReports() {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
    }

    // Attach client-side sentiment to each report
    return (data || []).map(report => {
        // Parse unfair_means if it's a JSON string
        if (typeof report.unfair_means === 'string') {
            try { report.unfair_means = JSON.parse(report.unfair_means); } catch { }
        }
        report.sentiment = analyzeSentiment(report.incident_details);
        return report;
    });
}

async function insertReport(reportData) {
    // Ensure unfair_means is stored as JSON string
    if (Array.isArray(reportData.unfair_means)) {
        reportData.unfair_means = JSON.stringify(reportData.unfair_means);
    }
    // Ensure evidence_collected is boolean
    reportData.evidence_collected = !!reportData.evidence_collected;

    const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select();

    if (error) {
        console.error('Supabase insert error:', error);
        throw error;
    }
    return data;
}

// Expose globally so dashboard.js and form_submit.js can use it
window.SupabaseClient = {
    fetchAllReports,
    insertReport,
    analyzeSentiment,
    supabase
};
