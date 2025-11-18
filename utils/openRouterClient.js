/*-----------------------------------------------------------------------------------------------------
| @blocktype openRouterClient
| @brief    Initializes and exports OpenRouter SDK client for AI operations
| @param    --
| @return   OpenRouter client instance
-----------------------------------------------------------------------------------------------------*/

import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  // apiKey: process.env.OPENROUTER_API_KEY,
  apiKey:
    "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",
});

export default openRouter;
