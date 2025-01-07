import { ofetch } from "ofetch";
import { useSession } from "../stores/sessionStore";

const fetcher = ofetch.create({ baseURL: import.meta.env.VITE_API });
const session = useSession();

export async function submitPrompt(prompt: string) {
  return await fetcher("/job", {
    retry: 5,
    retryDelay: 5000,
    timeout: 15000,
    method: "POST",
    body: {
      session_id: session.data.value?.id,
      prompt: prompt || "Start Wars",
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
