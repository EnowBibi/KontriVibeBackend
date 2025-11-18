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
