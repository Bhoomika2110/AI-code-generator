

import { generateResponse } from "../config/openRouter.js";
import Website from "../models/website.model.js";
import User from "../models/user.model.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

RETURN RAW JSON ONLY:
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}
`;


// =========================
// GENERATE WEBSITE
// =========================
export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "prompt is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "you have not enough credits to generate a website",
      });
    }

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt);

    let raw = "";
    let parsed = null;

    for (let i = 0; i < 2 && !parsed; i++) {
      raw = await generateResponse(finalPrompt);
      parsed = await extractJson(raw);

      if (!parsed) {
        raw = await generateResponse(
          finalPrompt + "\n\nRETURN ONLY RAW JSON."
        );
        parsed = await extractJson(raw);
      }
    }

    if (!parsed || !parsed.code) {
      console.log("ai returned invalid response", raw);
      return res.status(400).json({
        message: "ai returned invalid response",
      });
    }

    const website = await Website.create({
      user: user._id,
      title: prompt.slice(0, 60),
      latestCode: parsed.code,
      conversation: [
        { role: "ai", content: parsed.message },
        { role: "user", content: prompt },
      ],
    });

    user.credits -= 50;
    await user.save();

    return res.status(201).json({
      websiteId: website._id,
      remainingCredits: user.credits,
    });
  } catch (error) {
    return res.status(500).json({
      message: `generate website error ${error}`,
    });
  }
};


// =========================
// GET WEBSITE BY ID
// =========================
export const getWebsiteById = async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(400).json({ message: "website not found" });
    }

    return res.status(200).json(website);
  } catch (error) {
    return res.status(500).json({
      message: `get website by id error ${error}`,
    });
  }
};


// =========================
// UPDATE / CHANGES WEBSITE
// =========================
export const changes = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "prompt is required" });
    }

    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(400).json({ message: "website not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.credits < 25) {
      return res.status(400).json({
        message: "you have not enough credits to update website",
      });
    }

    const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY:
{
  "message":"short confirmation",
  "code":"<UPDATED FULL HTML>"
}
`;

    let raw = "";
    let parsed = null;

    for (let i = 0; i < 2 && !parsed; i++) {
      // ✅ FIXED HERE (was finalPrompt before)
      raw = await generateResponse(updatePrompt);
      parsed = await extractJson(raw);

      if (!parsed) {
        raw = await generateResponse(
          updatePrompt + "\n\nRETURN ONLY RAW JSON."
        );
        parsed = await extractJson(raw);
      }
    }

    if (!parsed || !parsed.code) {
      console.log("ai returned invalid response", raw);
      return res.status(400).json({
        message: "ai returned invalid response",
      });
    }

    website.conversation.push(
      { role: "user", content: prompt },
            { role: "ai", content: parsed.message }

    );

    website.latestCode = parsed.code;
    await website.save();

    user.credits -= 25;
    await user.save();

    return res.status(200).json({
      message: parsed.message,
      code: parsed.code,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: `update website error ${error}`,
    });
  }
};


// =========================
// GET ALL WEBSITES
// =========================
export const getAll = async (req, res) => {
  try {
    const websites = await Website.find({
      user: req.user._id,
    });

    return res.status(200).json(websites);
  } catch (error) {
    return res.status(500).json({
      message: `get all websites error ${error}`,
    });
  }
};



export const deploy =async (req,res)=>{
  try {
    const website =await Website.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    if (!website){
      return res.status(400).json({message:"website not found"})
    }

    if(!website.slug){
      website.slug=website.title.toLowerCase().replace(/[^a-z0-9]/g,"").
      slice(0,60)+website._id.toString().slice(-5)
    }
    website.deployed=true
    website.deployUrl=`${process.env.FRONTEND_URL}/site/${website.slug}`
    await website.save()

    return res.status(200).json({
      url:website.deployUrl
    })
  } catch (error) {
    return res.status(500).json({message: `deploy  websites error ${error}`})
  }
}


export const getBySlug=async (req,res)=>{
  try {
    const website=await Website.findOne({
      slug: req.params.slug,
      user: req.user._id
    })
    if(!website){
      return res.status(400).json({ message: "website not found"})
    }
    return res.status(200).json(website)
  } catch (error) {
    console.log(error);
        return res.status(500).json({message: ` get by slug deploy  websites error ${error}`})

  }
}





























