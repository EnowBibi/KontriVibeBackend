/*-----------------------------------------------------------------------------------------------------
| @blocktype openRouterClient
| @brief    Initializes and exports OpenRouter SDK client for AI operations
| @param    --
| @return   OpenRouter client instance
-----------------------------------------------------------------------------------------------------*/

import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default openRouter;
