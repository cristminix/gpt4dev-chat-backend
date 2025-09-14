import { Context } from "hono"
import { streamSSE } from "hono/streaming"

function isPromptMode(chatRequest: any) {
  return Array.isArray(chatRequest.prompt)
}
async function sendStreamResult(
  response: any,
  modelName: string,
  promptMode: boolean,
  c: Context
) {
  c.header("Content-Type", "text/event-stream")
  c.header("Cache-Control", "no-cache")
  c.header("Connection", "keep-alive")
  return streamSSE(c, async (stream) => {
    if (response) {
      let id = 1
      for await (const chunk of response) {
        // console.log(chunk.toString())
        await stream.write(chunk)
        // await stream.write(":\n\n")
      }
    }
  })
}
async function sendResult(
  response: any,
  modelName: string,
  promptMode: boolean,
  c: Context
) {
  const jsonResponse: any = {
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: modelName,

    //   usage: {
    //     prompt_tokens: 0,
    //     completion_tokens: 0,
    //     total_tokens: 0,
    //   },
  }
  for await (const chunk of response) {
    response = chunk
  }
  if (promptMode) {
    jsonResponse.choices = response.choices.map(
      (choice: any, index: number) => ({
        index,
        role: choice.message.role,
        text: choice.message.content,
        finish_reason: "stop",
      })
    )
  } else {
    jsonResponse.choices = response.choices.map(
      (choice: any, index: number) => ({
        index,
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
        finish_reason: "stop",
      })
    )
  }

  return c.json(jsonResponse)
}
async function* createCompletions(chatRequest: any) {
  let completionId = 1
  let randomAssistantMessageContent = `Hello world is another
  message that used to be the starter 
  programmmer to start learning`
  if (chatRequest.stream) {
    let data = {
      id: `chatcmpl-${Date.now()}`,
      model: chatRequest.model,
      object: "chat.completion.chunk",
      index: completionId,
      finish_reason: null,
      created: Date.now(),
      choices: [
        {
          delta: {
            content: randomAssistantMessageContent,
          },
        },
      ],
    }

    const lines = randomAssistantMessageContent.split("\n")
    const encoder = new TextEncoder()
    let index = 0
    while (index < lines.length) {
      await new Promise((resolve) => setTimeout(() => resolve(true), 256))
      yield encoder.encode(
        `data: ${JSON.stringify({
          id: `chatcmpl-${Date.now()}`,
          model: chatRequest.model,
          object: "chat.completion.chunk",
          index,
          finish_reason: null,
          created: Date.now(),
          choices: [
            {
              delta: {
                content: lines[index],
              },
            },
          ],
          done: true, // Flag akhir stream
        })}\n\n`
      )

      index += 1
    }
    yield encoder.encode(
      `data: ${JSON.stringify({
        id: `chatcmpl-${Date.now()}`,
        model: chatRequest.model,
        object: "chat.completion.chunk",
        index,
        finish_reason: "done",
        created: Date.now(),
        choices: [
          {
            delta: {
              content: "",
            },
          },
        ],
        done: true, // Flag akhir stream
      })}\n\ndata: [DONE]\n\n`
    )
  } else {
    let chatResponse: any = {
      choices: [
        {
          message: {
            role: "assistant",
            content: randomAssistantMessageContent,
          },
        },
      ],
    }
    yield chatResponse
  }
}
export async function handleDummyCompletions(chatRequest: any, c: Context) {
  if (typeof chatRequest.stream !== "boolean") {
    chatRequest.stream = true
  }
  console.log(chatRequest.stream)
  const response = await createCompletions(chatRequest)
  console.log({ response })
  const streaming = chatRequest.stream
  const promptMode = isPromptMode(chatRequest)
  const modelName = chatRequest.model
  return streaming
    ? await sendStreamResult(response, modelName, promptMode, c)
    : await sendResult(response, modelName, promptMode, c)
}
