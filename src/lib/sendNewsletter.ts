import { apiClient } from './apiClient';

export async function sendNewsletterIfPublished(
  type: 'newsletter',
  title: string,
  content: string,
  newStatus: string,
  oldStatus?: string,
  image?: string
) {
  const publishedStatuses = ['Published', 'Active', 'Open'];
  const isNowPublished = publishedStatuses.includes(newStatus);
  const wasPublished = oldStatus ? publishedStatuses.includes(oldStatus) : false;

  if (isNowPublished && !wasPublished) {
    try {
      const { data: subs, error: subsError } = await apiClient
        .from('subscribers')
        .select('email')
        .eq('status', 'Active');
      
      if (subsError) throw subsError;

      if (subs && subs.length > 0) {
        const emails = subs.map(s => s.email);
        await apiClient.functions.invoke("send-mail", {
          body: {
            type: "newsletter",
            payload: {
              subscribers: emails,
              subject: title,
              title: title,
              content: content,
              image: image,
              html: `<h2>${title}</h2><p>${content}</p>`
            }
          }
        });
      }
    } catch (err) {
      console.error("Failed to send newsletter email:", err);
    }
  }
}
