import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert at reading academic calendars. Given calendar text or content, extract ALL holidays, breaks, recesses, closures, and non-instructional days.

Return a JSON object using the extract_calendar_data tool with:
- semesterName: The name of the semester/academic period (e.g. "Fall 2024", "2024-2025 Academic Year")
- startDate: First date of the academic period (YYYY-MM-DD)
- endDate: Last date of the academic period (YYYY-MM-DD)
- totalHolidays: Total number of individual days off
- holidays: Array of holiday objects, each with:
  - name: Official name of the holiday/break
  - startDate: Start date (YYYY-MM-DD)
  - endDate: End date (YYYY-MM-DD), same as startDate if single day
  - description: Brief description
  - type: One of "Federal Holiday", "Holiday Break", "University Closure", or "Other"

Classification rules:
- "Federal Holiday": Nationally recognized holidays (MLK Day, Memorial Day, Independence Day, Labor Day, Thanksgiving Day, Christmas Day, New Year's Day, etc.)
- "Holiday Break": Multi-day breaks (Spring Break, Winter Break, Thanksgiving Break, Fall Break, etc.)
- "University Closure": Institution-specific closures not tied to federal holidays
- "Other": Reading days, study days, exam periods where no classes meet, etc.

Be thorough. Include every single day off mentioned. Count multi-day breaks as one entry but set the correct start/end dates.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calendarText, fileBase64, fileName, fileType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build user message content
    const userContent: any[] = [];

    if (calendarText) {
      userContent.push({ type: "text", text: `Here is the academic calendar text:\n\n${calendarText}` });
    } else if (fileBase64 && fileType) {
      if (fileType === "application/pdf") {
        // For PDF: send as file with base64
        userContent.push({
          type: "file",
          file: {
            filename: fileName || "calendar.pdf",
            file_data: `data:application/pdf;base64,${fileBase64}`,
          },
        });
        userContent.push({ type: "text", text: "Extract all holidays, breaks, and non-instructional days from this academic calendar PDF." });
      } else {
        // For images
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${fileType};base64,${fileBase64}` },
        });
        userContent.push({ type: "text", text: "Extract all holidays, breaks, and non-instructional days from this academic calendar image." });
      }
    } else {
      return new Response(JSON.stringify({ error: "No input provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "extract_calendar_data",
          description: "Return structured calendar analysis with all holidays and breaks.",
          parameters: {
            type: "object",
            properties: {
              semesterName: { type: "string" },
              startDate: { type: "string", description: "YYYY-MM-DD" },
              endDate: { type: "string", description: "YYYY-MM-DD" },
              totalHolidays: { type: "number" },
              holidays: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    startDate: { type: "string" },
                    endDate: { type: "string" },
                    description: { type: "string" },
                    type: {
                      type: "string",
                      enum: ["Federal Holiday", "Holiday Break", "University Closure", "Other"],
                    },
                  },
                  required: ["name", "startDate", "endDate", "description", "type"],
                  additionalProperties: false,
                },
              },
            },
            required: ["semesterName", "startDate", "endDate", "totalHolidays", "holidays"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "extract_calendar_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured data");
    }

    const calendarData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(calendarData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-calendar error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
