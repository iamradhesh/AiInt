import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAI } from "../services/openRouter.service.js";

// ✅ safely parses JSON even if AI wraps it in markdown fences
const safeParseJSON = (raw) => {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response as JSON");
  }
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filePath);
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        // ✅ proper string — no JS object concatenation
        content: `You are a resume parser. Extract structured data from the resume text.
Return ONLY a raw JSON object with no markdown, no explanation, no extra text.
The JSON must follow this exact format:
{
  "role": "the person's job title or role",
  "experience": "total years of experience as a string",
  "projects": ["project name 1", "project name 2"],
  "skills": ["skill1", "skill2"]
}`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAI(messages);

    // ✅ safe parse — handles markdown fences and surrounding text
    const parsedResponse = safeParseJSON(aiResponse);

    // ✅ async unlink — consistent with the rest of the async flow
    await fs.promises.unlink(filePath);

    return res.json({
      role: parsedResponse.role,
      experience: parsedResponse.experience,
      projects: parsedResponse.projects,
      skills: parsedResponse.skills,
      resumeText,
    });
  } catch (error) {
    console.error(error);

    // cleanup file if it still exists
    if (req.file && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({ error: error.message });
  }
};
