import { GoogleGenerativeAI } from "@google/generative-ai";
import {Child, Vaccination, Inventory, Appeal, HealthRecord, User } from "../models/index.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const calculateAge = (dob) => {
  if (!dob) return "Unknown";

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return "Unknown";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const generateAIResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Automatically retrieve actual role of the authenticated worker
    const role = req.user?.role;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let systemPrompt = "You are a helpful AI assistant.";
    let dbContext = {};

    if (role === 'staff' || role === 'aanganwadi_staff') {
      const user = await User.findById(req.user.id).select('name role aanganwadiCode');
      const childFilter = user?.aanganwadiCode ? { aanganwadiCode: user.aanganwadiCode } : {};
      const childrenRaw = await Child.find(childFilter).limit(50).lean();
      const childIds = childrenRaw.map((c) => c._id);

      const vaccinationsRaw = await Vaccination.find({ childId: { $in: childIds } }).populate('childId', 'name').lean().limit(50);
      const healthRecordsRaw = await HealthRecord.find({ childId: { $in: childIds } }).populate('childId', 'name').lean().limit(50);

      const children = childrenRaw.map(c => ({
        Name: c.name,
        Age: calculateAge(c.dateOfBirth),
        Gender: c.gender,
        DOB: c.dateOfBirth,
        AanganwadiCode: c.aanganwadiCode,
        Status: c.isActive ? 'Active' : 'Inactive'
      }));

      const healthRecords = healthRecordsRaw.map(hr => {
        const { _id, __v, childId, recordedBy, ...rest } = hr;
        return {
          Patient: hr.childId?.name || "Unknown",
          ...rest
        };
      });

      const vaccinations = vaccinationsRaw.map(v => ({
        Child: v.childId?.name || "Unknown",
        Vaccine: v.vaccineName,
        DateAdministered: v.dateAdministered,
        Status: v.status
      }));

      dbContext = { children, healthRecords, vaccinations, userName: user?.name };
      systemPrompt = `You are a helpful AI assistant for the Staff of an aanganwadi/healthcare management system. Help them understand child profiles, vaccination reports, and daily tasks. 
      Do not include any technical terms, IDs, or unnecessary database details in your response. Only show human readable names. 
      If asked for names and ages of students, provide the list directly from the Children context.
      Here is the relevant context from the system: ${JSON.stringify(dbContext)}. User query: ${prompt}`;

    } else if (role === 'coordinator') {
      const user = await User.findById(req.user.id).select('name role assignedAanganwadis');
      const inventoryRaw = await Inventory.find().lean().limit(50);
      const appealsRaw = await Appeal.find().populate('coordinatorId', 'name').lean().limit(50);
      
      const inventory = inventoryRaw.map(i => ({
        ItemName: i.itemName,
        Quantity: i.quantity,
        Status: i.status
      }));

      const appeals = appealsRaw.map(a => ({
        FromUser: a.coordinatorId?.name || "Unknown",
        Type: a.type,
        Description: a.description,
        Status: a.status
      }));

      dbContext = { inventory, appeals, userName: user?.name };
      systemPrompt = `You are a helpful AI assistant for the Coordinator of an aanganwadi/healthcare management system. Help them with overall site issues, inventory management, user queries, and appeals monitoring. 
      Do not include any database-related terms, IDs, or unnecessary details. Only show human readable names.
      Here is the relevant context from the system: ${JSON.stringify(dbContext)}. User query: ${prompt}`;

    } else if (role === 'doctor') {
      const user = await User.findById(req.user.id).select('name role volunteerAanganwadis isVolunteer');

      if (!user.isVolunteer || !user.volunteerAanganwadis || user.volunteerAanganwadis.length === 0) {
        return res.status(200).json({ reply: "You must be actively volunteering for an aanganwadi to access patient health records and queries." });
      }

      const eligibleChildren = await Child.find({ 
        aanganwadiCode: { $in: user.volunteerAanganwadis } 
      }).select('_id');
      const eligibleChildIds = eligibleChildren.map(c => c._id);

      const healthRecordsRaw = await HealthRecord.find({ childId: { $in: eligibleChildIds } }).populate('childId', 'name').populate('recordedBy', 'name').lean().limit(50);
      
      const healthRecords = healthRecordsRaw.map(hr => {
        const { _id, __v, childId, recordedBy, ...rest } = hr;
        return {
          Patient: hr.childId?.name || "Unknown",
          RecordedBy: hr.recordedBy?.name || "Unknown",
          ...rest
        };
      });

      dbContext = { healthRecords, userName: user?.name };
      systemPrompt = `You are a helpful AI assistant for the Doctor of an aanganwadi/healthcare system. Help them evaluate patient health, prescribe medications, and track medical history efficiently. 
      Do not include any database-related terms, ObjectIDs, timestamps or unnecessary database details. Only refer to entities by their names.
      Here is the relevant medical context: ${JSON.stringify(dbContext)}. User query: ${prompt}`;

    } else {
      systemPrompt = `You are a helpful AI assistant. Do not include ObjectIDs or database jargon. User query: ${prompt}`;
    }

    let text = "";
    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      text = response.text();
    } catch (apiError) {
      console.warn("Primary model failed or busy, falling back to gemini-pro...", apiError.message);
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await fallbackModel.generateContent(systemPrompt);
      const response = await result.response;
      text = response.text();
    }

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate AI response. The service might be temporarily unavailable." });
  }
};
