export const STANDARDS_DATA = [
  {
    id: 2, name: "BGS", code: "BGS",
    description: "Beckett Grading Services. Uses four subgrades (Centering, Corners, Edges, Surface). Strictest for top grades — requires 50/50 front for Pristine 10.",
    website: "https://www.beckett.com/grading-standards",
    standards: [
      { id: 11, grade: "10", label: "Pristine", front_centering: "50/50", back_centering: "60/40" },
      { id: 12, grade: "9.5", label: "Gem Mint", front_centering: "55/45", back_centering: "60/40" },
      { id: 13, grade: "9", label: "Mint", front_centering: "55/45", back_centering: "65/35" },
      { id: 14, grade: "8.5", label: "NM-MT+", front_centering: "60/40", back_centering: "70/30" },
      { id: 15, grade: "8", label: "NM-MT", front_centering: "60/40", back_centering: "80/20" },
      { id: 16, grade: "7.5", label: "Near Mint+", front_centering: "65/35", back_centering: "85/15" },
      { id: 17, grade: "7", label: "Near Mint", front_centering: "70/30", back_centering: "90/10" },
      { id: 18, grade: "6.5", label: "EX-NM+", front_centering: "75/25", back_centering: "90/10" },
      { id: 19, grade: "6", label: "EX-NM", front_centering: "80/20", back_centering: "90/10" },
      { id: 20, grade: "5", label: "Excellent", front_centering: "85/15", back_centering: "No Limit" },
    ]
  },
  {
    id: 3, name: "CGC", code: "CGC",
    description: "Certified Guaranty Company. Distinguishes Pristine 10 (50/50) from Gem Mint 10 (55/45). Uses AI-assisted centering measurement.",
    website: "https://www.cgccards.com/card-grading/grading-scale/",
    standards: [
      { id: 21, grade: "10 (Pristine)", label: "Pristine", front_centering: "50/50", back_centering: "50/50" },
      { id: 22, grade: "10 (Gem Mint)", label: "Gem Mint", front_centering: "55/45", back_centering: "75/25" },
      { id: 23, grade: "9.5", label: "Mint+", front_centering: "55/45", back_centering: "80/20" },
      { id: 24, grade: "9", label: "Mint", front_centering: "60/40", back_centering: "90/10" },
      { id: 25, grade: "8.5", label: "NM-MT+", front_centering: "65/35", back_centering: "90/10" },
      { id: 26, grade: "8", label: "NM-MT", front_centering: "65/35", back_centering: "90/10" },
      { id: 27, grade: "7.5", label: "Near Mint+", front_centering: "70/30", back_centering: "90/10" },
      { id: 28, grade: "7", label: "Near Mint", front_centering: "70/30", back_centering: "90/10" },
      { id: 29, grade: "6.5", label: "EX-NM+", front_centering: "75/25", back_centering: "90/10" },
      { id: 30, grade: "6", label: "EX-NM", front_centering: "80/20", back_centering: "90/10" },
    ]
  },
  {
    id: 1, name: "PSA", code: "PSA",
    description: "Professional Sports Authenticator. Updated early 2025 — PSA 10 tightened from 60/40 to 55/45 front centering. Does not use half-point grades.",
    website: "https://www.psacard.com/gradingstandards",
    standards: [
      { id: 1, grade: "10", label: "Gem Mint", front_centering: "55/45", back_centering: "75/25" },
      { id: 2, grade: "9", label: "Mint", front_centering: "60/40", back_centering: "90/10" },
      { id: 3, grade: "8", label: "NM-MT", front_centering: "65/35", back_centering: "90/10" },
      { id: 4, grade: "7", label: "Near Mint", front_centering: "70/30", back_centering: "90/10" },
      { id: 5, grade: "6", label: "EX-MT", front_centering: "75/25", back_centering: "90/10" },
      { id: 6, grade: "5", label: "Excellent", front_centering: "85/15", back_centering: "90/10" },
      { id: 7, grade: "4", label: "VG-EX", front_centering: "85/15", back_centering: "90/10" },
      { id: 8, grade: "3", label: "Very Good", front_centering: "90/10", back_centering: "90/10" },
      { id: 9, grade: "2", label: "Good", front_centering: "90/10", back_centering: "No Limit" },
      { id: 10, grade: "1", label: "Poor", front_centering: "No Limit", back_centering: "No Limit" },
    ]
  },
  {
    id: 4, name: "SGC", code: "SGC",
    description: "Sportscard Guaranty Corporation. Strictest on back centering — requires 55/45 back for Gem Mint 10, tightest in the industry.",
    website: "https://www.gosgc.com/card-grading/scale",
    standards: [
      { id: 31, grade: "10 (Pristine)", label: "Pristine", front_centering: "50/50", back_centering: "50/50" },
      { id: 32, grade: "10 (Gem Mint)", label: "Gem Mint", front_centering: "55/45", back_centering: "55/45" },
      { id: 33, grade: "9.5", label: "Mint+", front_centering: "60/40", back_centering: "60/40" },
      { id: 34, grade: "9", label: "Mint", front_centering: "60/40", back_centering: "65/35" },
      { id: 35, grade: "8.5", label: "NM-MT+", front_centering: "65/35", back_centering: "65/35" },
      { id: 36, grade: "8", label: "NM-MT", front_centering: "65/35", back_centering: "70/30" },
      { id: 37, grade: "7.5", label: "Near Mint+", front_centering: "70/30", back_centering: "75/25" },
      { id: 38, grade: "7", label: "Near Mint", front_centering: "70/30", back_centering: "80/20" },
      { id: 39, grade: "6", label: "EX-NM", front_centering: "75/25", back_centering: "85/15" },
      { id: 40, grade: "5", label: "Excellent", front_centering: "80/20", back_centering: "90/10" },
    ]
  },
  {
    id: 5, name: "TAG", code: "TAG",
    description: "Technical Authentication & Grading. Uses a 1000-point scoring system. Most precise tolerances (e.g., 51/49). Values shown are for Sports cards.",
    website: "https://taggrading.com/pages/rubric",
    standards: [
      { id: 41, grade: "10", label: "Pristine", front_centering: "51/49", back_centering: "55/45" },
      { id: 42, grade: "9.5", label: "Gem Mint", front_centering: "51/49", back_centering: "55/45" },
      { id: 43, grade: "9", label: "Mint", front_centering: "55/45", back_centering: "70/30" },
      { id: 44, grade: "8.5", label: "NM-MT+", front_centering: "60/40", back_centering: "90/10" },
      { id: 45, grade: "8", label: "NM-MT", front_centering: "65/35", back_centering: "90/10" },
      { id: 46, grade: "7.5", label: "Near Mint+", front_centering: "67.5/32.5", back_centering: "95/5" },
      { id: 47, grade: "7", label: "Near Mint", front_centering: "70/30", back_centering: "95/5" },
      { id: 48, grade: "6", label: "EX-NM", front_centering: "75/25", back_centering: "No Limit" },
      { id: 49, grade: "5", label: "Excellent", front_centering: "80/20", back_centering: "No Limit" },
      { id: 50, grade: "4", label: "VG-EX", front_centering: "85/15", back_centering: "No Limit" },
    ]
  },
];
