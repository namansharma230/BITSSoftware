// Mock API for testing the dashboard without overriding fetch
// Exposes window.MockAPI.fetchReports() that returns data matching dashboard expectations
(function(){
  const mockReports = [
    {
      id: 1,
      date: '2023-11-15',
      student_name: 'John Doe',
      course: 'CS101',
      unfair_means: '{"cheating": true, "plagiarism": false, "impersonation": false}',
      evidence_collected: true,
      incident_details: 'Student was found using a mobile phone during the exam. A cheat sheet was also discovered.',
      sentiment: 'NEGATIVE'
    },
    {
      id: 2,
      date: '2023-11-20',
      student_name: 'Jane Smith',
      course: 'MATH202',
      unfair_means: '{"cheating": false, "plagiarism": true, "impersonation": false}',
      evidence_collected: false,
      incident_details: 'Student was observed talking to another student during the exam.',
      sentiment: 'NEGATIVE'
    },
    {
      id: 3,
      date: '2023-12-05',
      student_name: 'Alex Johnson',
      course: 'PHY301',
      unfair_means: '{"cheating": false, "plagiarism": false, "impersonation": true}',
      evidence_collected: true,
      incident_details: 'Student had unauthorized formula sheet hidden under the answer sheet.',
      sentiment: 'NEGATIVE'
    },
    {
      id: 4,
      date: '2023-12-10',
      student_name: 'Sarah Williams',
      course: 'CS101',
      unfair_means: '{"cheating": false, "plagiarism": true, "impersonation": false}',
      evidence_collected: true,
      incident_details: 'Student was caught using a mobile phone to access course materials during the exam.',
      sentiment: 'POSITIVE'
    },
    {
      id: 5,
      date: '2024-01-15',
      student_name: 'Michael Brown',
      course: 'CHEM101',
      unfair_means: '{"cheating": false, "plagiarism": false, "impersonation": true}',
      evidence_collected: true,
      incident_details: 'Another student was attempting to take the exam on behalf of the registered student.',
      sentiment: 'NEGATIVE'
    }
  ];

  window.MockAPI = {
    async fetchReports() {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 300));
      return mockReports;
    }
  };
})();