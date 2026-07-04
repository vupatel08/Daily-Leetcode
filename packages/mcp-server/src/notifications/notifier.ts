/**
 * Notifier abstraction. Implementations deliver conflict/violation events
 * to an external channel (Slack, etc). Uses global fetch (Node 18+), so no
 * extra dependencies are required.
 */
export interface Notifier {
  notifyConflict(description: string, details?: string): Promise<void>;
  notifyViolation(summary: string, details?: string): Promise<void>;
  notifyDecision(title: string, priority: string): Promise<void>;
}

/** No-op notifier used when notifications are not configured. */
export class NullNotifier implements Notifier {
  async notifyConflict(): Promise<void> {}
  async notifyViolation(): Promise<void> {}
  async notifyDecision(): Promise<void> {}
}

/**
 * SlackNotifier posts messages to a Slack Incoming Webhook.
 */
export class SlackNotifier implements Notifier {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  private async post(text: string): Promise<void> {
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      // Never let notification failures break the main flow
      console.error('[SlackNotifier] failed to post:', err);
    }
  }

  async notifyConflict(description: string, details?: string): Promise<void> {
    await this.post(
      `:warning: *Groundwork conflict detected*\n${description}${details ? `\n${details}` : ''}`
    );
  }

  async notifyViolation(summary: string, details?: string): Promise<void> {
    await this.post(
      `:no_entry: *Groundwork PR violation*\n${summary}${details ? `\n${details}` : ''}`
    );
  }

  async notifyDecision(title: string, priority: string): Promise<void> {
    await this.post(`:memo: *New ${priority} decision captured*\n${title}`);
  }
}

/**
 * Build a notifier from configuration / environment.
 */
export function createNotifier(webhookUrl?: string): Notifier {
  const url = webhookUrl || process.env.GROUNDWORK_SLACK_WEBHOOK;
  return url ? new SlackNotifier(url) : new NullNotifier();
}
