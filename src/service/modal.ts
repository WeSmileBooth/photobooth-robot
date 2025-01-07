import { ofetch } from "ofetch";
import { useSession } from "../stores/sessionStore";

const fetcher = ofetch.create({ baseURL: import.meta.env.VITE_API });
const session = useSession();

export async function submitPrompt() {
  console.log("sen");
  return await fetcher("/job", {
    retry: 5,
    retryDelay: 5000,
    timeout: 15000,
    method: "POST",
    body: {
      session_id: session.data.value?.id,
      // prompt:
      //   "A vintage portrait of a person in black Santa clothes, standing in a rustic cheese storage room filled with wooden shelves stacked with various cheeses. Soft, warm lighting illuminates the subject's face, enhancing their features and creating a cozy atmosphere. The camera angle is slightly above eye level, capturing a natural smile and relaxed pose, while the blurred cheese storage background draws focus to the subject.",
      prompt: "A playful musician in ancient ruins performing melodies",
    },
  });
}

export async function getJobResult(jobId: string) {
  return await fetcher<string>(`/job/${jobId}`, {
    method: "GET",
  });
}

export async function getSignedUrl(url: string) {
  return await fetcher<string>(`/blob/${url}`, {
    method: "GET",
  });
}
