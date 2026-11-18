window.CampusResources = [
      {
        id: "learning", name: "Learning Support Center", category: "Academic support",
        icon: "📚", tone: "tone-blue", location: "Learning Commons · Room 204",
        hours: "Mon–Fri, 9:00 AM–5:00 PM", open: true,
        description: "A welcoming place to plan your studies, build strong learning habits, and connect with tutoring support.",
        phone: "(555) 010-2400", email: "learning@example.edu", popular: true
      },
      {
        id: "technology", name: "Technology Help Desk", category: "Technology",
        icon: "💻", tone: "tone-mint", location: "Library · First floor",
        hours: "Mon–Fri, 8:00 AM–6:00 PM", open: true,
        description: "Get help with campus accounts, Wi-Fi access, classroom technology, and common software questions.",
        phone: "(555) 010-1212", email: "helpdesk@example.edu", popular: true
      },
      {
        id: "advising", name: "Academic Advising", category: "Academic support",
        icon: "🗓️", tone: "tone-lilac", location: "Student Center · Suite 110",
        hours: "Mon–Thu, 9:00 AM–4:00 PM", open: true,
        description: "Talk through course planning, degree requirements, and the next steps toward your academic goals.",
        phone: "(555) 010-3320", email: "advising@example.edu", popular: true
      },
      {
        id: "wellness", name: "Wellness & Counseling", category: "Wellness",
        icon: "🌿", tone: "tone-mint", location: "Wellness Building · Room 101",
        hours: "Mon–Fri, 9:00 AM–4:30 PM", open: true,
        description: "Find information about wellbeing resources and how to request a confidential appointment.",
        phone: "(555) 010-8877", email: "wellness@example.edu", popular: false
      },
      {
        id: "career", name: "Career Studio", category: "Student services",
        icon: "✨", tone: "tone-peach", location: "Innovation Hall · Room 18",
        hours: "Tue–Fri, 10:00 AM–4:00 PM", open: false,
        description: "Explore career resources, resume guidance, and ways to prepare for internships and interviews.",
        phone: "(555) 010-4770", email: "careers@example.edu", popular: false
      },
      {
        id: "library", name: "Library & Research Desk", category: "Academic support",
        icon: "🔎", tone: "tone-yellow", location: "Main Library · Ground floor",
        hours: "Mon–Sun, 8:00 AM–10:00 PM", open: true,
        description: "Find research help, library resources, study spaces, and assistance with citations and databases.",
        phone: "(555) 010-2000", email: "library@example.edu", popular: false
      },
      {
        id: "student-life", name: "Student Life Office", category: "Student services",
        icon: "🎉", tone: "tone-rose", location: "Student Center · Room 205",
        hours: "Mon–Fri, 9:00 AM–5:00 PM", open: true,
        description: "Learn about student organizations, campus activities, and ways to get involved in the community.",
        phone: "(555) 010-5510", email: "studentlife@example.edu", popular: false
      },
      {
        id: "accessibility", name: "Accessibility Services", category: "Student services",
        icon: "♿", tone: "tone-blue", location: "Welcome Center · Suite 30",
        hours: "Mon–Fri, 9:00 AM–4:00 PM", open: true,
        description: "Connect with the office to learn about accessibility resources and the process for requesting support.",
        phone: "(555) 010-6611", email: "access@example.edu", popular: false
      }
    ];

window.CampusTasks = [
  {
    id: "tutoring",
    title: "Find tutoring support",
    category: "Academic support",
    search: "tutoring",
    searchMatch: "tutor",
    resourceId: "learning"
  },
  {
    id: "technology",
    title: "Find technology help",
    category: "Technology",
    search: "technology",
    resourceId: "technology"
  },
  {
    id: "advising",
    title: "Find academic advising",
    category: "Academic support",
    search: "advising",
    resourceId: "advising"
  }
];
