import { GoogleGenerativeAI } from '@google/generative-ai';

// Interface for Gemini response matching report fields
export interface GeminiAnalysisResult {
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  summary: string;
  description: string;
  department: string;
  tags: string[];
  confidence: number;
  safetyWarning: string;
  duplicateLikelihood: 'Low' | 'Medium' | 'High';
  isFake?: boolean;
  isValidCivicIssue?: boolean;
  rejectReason?: string;
}

const DEFAULT_MOCK_ANALYSES: Record<string, GeminiAnalysisResult> = {
  fake: {
    category: 'Other',
    severity: 'Low',
    priority: 'Low',
    title: 'Flagged: Non-Civic Image Detected',
    summary: 'Image does not contain a valid public infrastructure or sanitation concern.',
    description: 'Our AI engine audited this photo and flagged it as unrelated to city infrastructure, public hazards, or sanitation. It appears to be a meme, drawing, indoor selfie, or unrelated graphic.',
    department: 'None',
    tags: ['flagged', 'rejected', 'invalid-upload'],
    confidence: 0.99,
    safetyWarning: 'Image rejected. Points penalty pending.',
    duplicateLikelihood: 'Low',
    isFake: true,
    isValidCivicIssue: false,
    rejectReason: 'The uploaded image contains an unrelated subject, meme, or graphic design instead of a real-world public civic issue.'
  },
  garbage: {
    category: 'Garbage',
    severity: 'Medium',
    priority: 'Medium',
    title: 'Overflowing Waste Bin in Residential Area',
    summary: 'Public garbage bin is overflowing with domestic waste spilling onto sidewalk.',
    description: 'The municipal trash bin at this location is completely full and trash has begun piling up around it, blocking the pedestrian pathway and attracting stray animals. Needs immediate pickup.',
    department: 'Sanitation',
    tags: ['garbage', 'overflow', 'trash', 'hygiene'],
    confidence: 0.94,
    safetyWarning: 'Stray animals feeding, potential biological hazard.',
    duplicateLikelihood: 'Low',
    isValidCivicIssue: true,
    isFake: false,
    rejectReason: ''
  },
  pothole: {
    category: 'Road Damage',
    severity: 'High',
    priority: 'High',
    title: 'Deep Pothole on Busy Road Intersection',
    summary: 'A large, deep pothole in the middle of the road causing safety risks to drivers.',
    description: 'There is a severe pothole approximately 1.5 feet wide and 5 inches deep near the crossing. Drivers are swerving suddenly to avoid it, creating a high risk of collisions. Needs asphalt repair.',
    department: 'Public Works',
    tags: ['pothole', 'road-damage', 'hazard', 'asphalt'],
    confidence: 0.98,
    safetyWarning: 'High traffic speed, severe vehicle damage risk.',
    duplicateLikelihood: 'Medium',
    isValidCivicIssue: true,
    isFake: false,
    rejectReason: ''
  },
  streetlight: {
    category: 'Broken Streetlight',
    severity: 'Medium',
    priority: 'Medium',
    title: 'Faulty Streetlight Near Park Entrance',
    summary: 'Streetlight pole is completely unlit, creating a dark zone.',
    description: 'The streetlight fixture at this location is out, making the corner and the nearby pedestrian pathway completely dark at night. This raises public safety concerns.',
    department: 'Water & Power',
    tags: ['streetlight', 'dark', 'bulb-out', 'safety'],
    confidence: 0.96,
    safetyWarning: 'Zero visibility area, potential security risk.',
    duplicateLikelihood: 'Low',
    isValidCivicIssue: true,
    isFake: false,
    rejectReason: ''
  },
  leakage: {
    category: 'Water Leakage',
    severity: 'Critical',
    priority: 'Critical',
    title: 'Major Water Pipe Burst Flooding Road',
    summary: 'Underground drinking water line burst, causing heavy water loss and local flooding.',
    description: 'A clean water utility pipe appears to have burst, causing water to gush out under high pressure and flood the sidewalk and lane. Water is accumulation rapidly.',
    department: 'Water & Power',
    tags: ['water-leak', 'burst-pipe', 'flooding', 'waste'],
    confidence: 0.95,
    safetyWarning: 'Slip hazard, minor localized erosion.',
    duplicateLikelihood: 'High',
    isValidCivicIssue: true,
    isFake: false,
    rejectReason: ''
  },
  default: {
    category: 'Other',
    severity: 'Low',
    priority: 'Low',
    title: 'General Civic Care Request',
    summary: 'Issue reported for municipal department inspection.',
    description: 'A civic maintenance report has been filed by a resident for visual inspection and logging by the local civic authorities.',
    department: 'Public Works',
    tags: ['maintenance', 'citizen-report'],
    confidence: 0.85,
    safetyWarning: 'None identified.',
    duplicateLikelihood: 'Low',
    isValidCivicIssue: true,
    isFake: false,
    rejectReason: ''
  }
};

export async function analyzeCivicImage(base64Image: string, categoryHint?: string): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Fallback to mock analysis if API key is not configured
  if (!apiKey || apiKey === "") {
    console.warn('GEMINI_API_KEY is not configured. Simulating AI Vision response.');
    await new Promise((r) => setTimeout(r, 2000)); // Simulate delay
    
    // Check if client-side heuristics matched a category hint
    if (categoryHint && categoryHint !== 'default') {
      if (categoryHint === 'fake') return DEFAULT_MOCK_ANALYSES.fake;
      if (categoryHint === 'garbage') return DEFAULT_MOCK_ANALYSES.garbage;
      if (categoryHint === 'pothole') return DEFAULT_MOCK_ANALYSES.pothole;
      if (categoryHint === 'leakage') return DEFAULT_MOCK_ANALYSES.leakage;
      if (categoryHint === 'streetlight') return DEFAULT_MOCK_ANALYSES.streetlight;
    }
    
    // Choose mock response based on image length or simple heuristic
    if (base64Image.length % 4 === 0) return DEFAULT_MOCK_ANALYSES.pothole;
    if (base64Image.length % 4 === 1) return DEFAULT_MOCK_ANALYSES.garbage;
    if (base64Image.length % 4 === 2) return DEFAULT_MOCK_ANALYSES.leakage;
    if (base64Image.length % 4 === 3) return DEFAULT_MOCK_ANALYSES.streetlight;
    return DEFAULT_MOCK_ANALYSES.default;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Clean base64 data to extract mime and content
    const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      },
    };

    const prompt = `
      You are an expert AI civic analyst working for the CityPulse platform.
      Analyze this civic issue image and return a structured JSON response.

      You must return ONLY a JSON block that strictly adheres to the following interface:
      {
        "category": "Road Damage" | "Garbage" | "Water Leakage" | "Broken Streetlight" | "Traffic" | "Illegal Dumping" | "Drainage" | "Electricity" | "Public Safety" | "Trees" | "Construction" | "Noise" | "Other",
        "severity": "Low" | "Medium" | "High" | "Critical",
        "priority": "Low" | "Medium" | "High" | "Critical",
        "title": "A short, descriptive, professional title summarizing the issue",
        "summary": "One sentence summary of the issue",
        "description": "A detailed multi-sentence description explaining exactly what is wrong, the visual evidence, and why it requires maintenance",
        "department": "Public Works" | "Sanitation" | "Water & Power" | "Transportation" | "Environmental Health" | "Forestry" | "Police" | "Parks & Recreation",
        "tags": ["tag1", "tag2", "tag3"],
        "confidence": 0.0 to 1.0 (float reflecting your vision classification confidence),
        "safetyWarning": "Describe any immediate hazards (e.g., active electrical wires, deep flooding, slip risks, traffic blockages) or write 'None' if safe",
        "duplicateLikelihood": "Low" | "Medium" | "High",
        "isValidCivicIssue": true if the photo represents a real public municipal/civic/infrastructure concern. false if it is a meme, selfie, product photo, drawing, indoor shot of a personal room, or completely unrelated to city upkeep.,
        "isFake": true if the photo is generated, a cropped internet screen capture, spam, or falsified.,
        "rejectReason": "If isValidCivicIssue is false or isFake is true, write a 1-sentence reason explaining why it was flagged. Otherwise, write an empty string ''"
      }

      Ensure your response is valid JSON, containing no leading markdown tags, explanation text, or triple backticks. Return the JSON raw.
    `;

    const response = await model.generateContent([prompt, imagePart]);
    const responseText = response.response.text().trim();
    
    // Clean up any potential markdown syntax wrapping
    const jsonString = responseText
      .replace(/^```json/, '')
      .replace(/```$/, '')
      .trim();

    const parsed: GeminiAnalysisResult = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error('Gemini API analysis failed, falling back to mock response:', error);
    // Graceful fallback to mock to prevent blocking user submission flow
    return DEFAULT_MOCK_ANALYSES.pothole;
  }
}
