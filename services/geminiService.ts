
import { GoogleGenAI, Type } from "@google/genai";
import { Activity, UserPreferences } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchActivities = async (prefs: UserPreferences): Promise<Activity[]> => {
  const modelId = "gemini-2.5-flash";

  // Construct a detailed description of the squad
  const squadDescription = prefs.squad
    .map(member => `- ${member.name} is interested in: ${member.interest}`)
    .join('\n');

  // Determine the location string to send to AI
  // If user used "Current GPS Location", we prioritize coordinates
  const locationContext = prefs.locationName.includes("GPS Location") && prefs.userCoordinates
      ? `Latitude: ${prefs.userCoordinates.lat}, Longitude: ${prefs.userCoordinates.lng}`
      : prefs.locationName;

  // Get current time context
  const now = new Date().toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' });

  // Handle Exclusions
  const exclusionPrompt = prefs.excludedCategories.length > 0 
    ? `CRITICAL: The group explicitly HATES/AVOIDS the following: ${prefs.excludedCategories.join(", ")}. DO NOT suggest any activities related to these categories.` 
    : "";

  const prompt = `
    Act as a hyper-local concierge for a group of friends. 
    They are located at: ${locationContext}.
    
    Current Time: ${now}. 
    Please prioritize events that are open or happening RIGHT NOW or SOON (e.g., Happy Hours, Night Markets, Live Music) if applicable to the current time.

    The group consists of ${prefs.squad.length} people with the following distinct interests:
    ${squadDescription}

    Budget Level: ${prefs.budget}.
    (Cheap = < 20€, Moderate = 20-50€, Expensive = > 50€).
    Duration: ${prefs.duration}.

    ${exclusionPrompt}

    Suggest 8 distinct, REAL-WORLD activities or places that satisfy this SPECIFIC combination of people.
    Find the best compromise or a place that offers multiple things (e.g., a bar with games, a park with food trucks).
    
    Crucial: Provide the exact real-world name of the place so I can find a photo of it.
    For coordinates, provide the precise real-world latitude and longitude.
    Provide an estimated price per person (e.g. "15-20€" or "Free").
    
    Return the response in strictly valid JSON format conforming to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING, description: "Short summary (1 sentence)" },
              fullDescription: { type: Type.STRING, description: "A detailed, engaging paragraph describing the specific vibe, what to do there, and why it's great." },
              matchReason: { type: Type.STRING, description: "Explain why this fits the specific mix of friends" },
              vibeScore: { type: Type.NUMBER, description: "Match percentage 0-100" },
              category: { type: Type.STRING, enum: ["Food", "Nightlife", "Activity", "Culture", "Outdoors"] },
              priceRange: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              pricePerPerson: { type: Type.STRING, description: "Estimated cost per person" },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                },
                required: ["lat", "lng"]
              },
              address: { type: Type.STRING },
            },
            required: ["id", "name", "description", "fullDescription", "matchReason", "vibeScore", "category", "priceRange", "pricePerPerson", "coordinates"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    return JSON.parse(jsonText) as Activity[];

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
