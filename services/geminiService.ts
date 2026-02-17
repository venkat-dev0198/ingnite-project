
import { GoogleGenAI } from "@google/genai";
import { NearbyPlace } from "../types";

export const getNearbyHelp = async (lat: number, lng: number): Promise<{ places: NearbyPlace[], text: string }> => {
  try {
    // Correct initialization using named parameter and process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      // Maps grounding is only supported in Gemini 2.5 series models.
      model: "gemini-2.5-flash",
      contents: `Find the nearest police stations, hospitals, and 24/7 women safety helplines near coordinates ${lat}, ${lng}. Provide a summary of the safest locations and emergency services available in this area.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    // Access groundingMetadata from response.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    // Correctly accessing the text property.
    const text = response.text || "Searching for nearby help...";

    const places: NearbyPlace[] = groundingChunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        name: chunk.maps.title || "Emergency Location",
        address: chunk.maps.title || "View on Map",
        type: chunk.maps.title.toLowerCase().includes('hospital') ? 'Hospital' : 
              chunk.maps.title.toLowerCase().includes('police') ? 'Police' : 'Helpline',
        uri: chunk.maps.uri
      }));

    return { places, text };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { places: [], text: "Failed to load nearby emergency services. Please call 112 or local emergency numbers directly." };
  }
};
