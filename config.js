const videoConfig = {
    "videoId": "efHYzQwahtw",
    "checkpoints": [
        // Company and role questions at 29 seconds
        {
            "timestamp": 29,
            "id": "company_role",
            "type": "single_choice",
            "question": "What type of company do you work at?",
            "options": ["OEM", "ODM", "EMS", "E2MS", "Other"]
        },
        {
            "timestamp": 29,
            "id": "role",
            "type": "text", 
            "question": "What's your role?"
        },
        // Pricing and availability importance at 52 seconds
        {
            "timestamp": 52,
            "id": "pricing_importance",
            "type": "scale_1_to_5",
            "question": "How would you rate the importance of finding pricing and availability data using GPT?"
        },
        // Data manipulation importance at 67 seconds
        {
            "timestamp": 67,
            "id": "data_manipulation",
            "type": "scale_1_to_5",
            "question": "How would you rate the importance of manipulating data into bespoke tables using GPT?"
        },
        // Part alternatives importance at 94 seconds
        {
            "timestamp": 94,
            "id": "alternatives_importance",
            "type": "scale_1_to_5",
            "question": "How would you rate the importance of finding part alternatives using GPT?"
        },
        // Datasheets importance at 124 seconds
        {
            "timestamp": 124,
            "id": "datasheets_importance",
            "type": "scale_1_to_5",
            "question": "How would you rate the importance of fetching, comparing, and explaining datasheets using GPT?"
        },
        // Compliance importance at 141 seconds
        {
            "timestamp": 141,
            "id": "compliance_importance",
            "type": "scale_1_to_5",
            "question": "How would you rate the importance of checking compliance information using GPT?"
        },
        // Documentation importance at 165 seconds
        {
            "timestamp": 165,
            "id": "docs_importance",
            "type": "scale_1_to_5",
            "question": "How would you rate the importance of uploading your own documentation and having it available across conversations?"
        },
        // Content generation importance at 182 seconds
        {
            "timestamp": 182,
            "id": "content_generation",
            "type": "scale_1_to_5",
            "question": "How would you rate the importance of generating content (e.g., emails) using GPT?"
        },
        // Missing features and preference at 188 seconds
        {
            "timestamp": 188,
            "id": "missing_features",
            "type": "text",
            "question": "Which feature is currently missing that you would love to have in this category?"
        },
        {
            "timestamp": 188,
            "id": "feature_preference",
            "type": "single_choice",
            "question": "If you could only have one of these features available today, which one would it be?",
            "options": ["Search & Availability", "Data Manipulation", "Finding Alternatives", "Fetching and Explaining Datasheets", "Compliance Checks", "Docs across conversations", "Email/Template Generation"]
        },
        // Background agent features at 235 seconds
        {
            "timestamp": 235,
            "id": "background_agent",
            "type": "rating_block",
            "title": "Background AI Agent Features",
            "description": "Please rate each feature for the background AI agent.",
            "features": [
                { "id": "pcn_summary", "label": "PCN summary" },
                { "id": "obsolescence_risks", "label": "Obsolescence risks" }
            ],
            "freeTextLabel": "Which feature is currently missing that you'd love to have in this category?"
        },
        {
            "timestamp": 235,
            "id": "agent_preference",
            "type": "single_choice",
            "question": "If you could only have one of these features available today, which one would it be?",
            "options": ["PCN summary", "Obsolescence risk"]
        },
        // Final thoughts at 253 seconds
        {
            "timestamp": 253,
            "id": "final_thoughts_email",
            "type": "text",
            "question": "If you have any final thoughts, share here. Also your email address if you'd like to give more detailed feedback over an interview."
        }
    ]
};
