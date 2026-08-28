/**
 * Microsoft Teams Integration for Comment Notifications
 */

import axios from 'axios'

interface CommentNotificationPayload {
  targetType: 'project' | 'stage' | 'point'
  targetName: string
  targetId: number
  author: string
  content: string
  commentUrl: string
}

export async function notifyTeamsNewComment(payload: CommentNotificationPayload): Promise<void> {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('TEAMS_WEBHOOK_URL not set. Skipping Teams notification.')
    return
  }

  const color = {
    project: '0078D4',  // Blue
    stage: '107C10',     // Green
    point: 'FFB900',     // Gold
  }[payload.targetType]

  const message = {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: `New comment on ${payload.targetType}: ${payload.targetName}`,
    themeColor: color,
    sections: [
      {
        activityTitle: `New Comment on ${payload.targetType.toUpperCase()}`,
        activitySubtitle: payload.targetName,
        facts: [
          {
            name: 'Type',
            value: payload.targetType.charAt(0).toUpperCase() + payload.targetType.slice(1),
          },
          {
            name: 'Author',
            value: payload.author,
          },
          {
            name: 'Content',
            value: payload.content.substring(0, 200) + (payload.content.length > 200 ? '...' : ''),
          },
        ],
        markdown: true,
      },
    ],
    potentialAction: [
      {
        '@type': 'OpenUri',
        name: 'View Comment',
        targets: [
          {
            os: 'default',
            uri: payload.commentUrl,
          },
        ],
      },
    ],
  }

  try {
    await axios.post(webhookUrl, message)
    console.log(`✅ Teams notification sent for ${payload.targetType} #${payload.targetId}`)
  } catch (error) {
    console.error('❌ Failed to send Teams notification:', error)
  }
}

export async function notifyTeamsStatusChange(
  targetType: 'project' | 'stage' | 'point',
  targetName: string,
  oldStatus: string,
  newStatus: string,
  url: string
): Promise<void> {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('TEAMS_WEBHOOK_URL not set. Skipping Teams notification.')
    return
  }

  const message = {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: `${targetType} status changed: ${oldStatus} → ${newStatus}`,
    themeColor: '0078D4',
    sections: [
      {
        activityTitle: `${targetType.toUpperCase()} Status Updated`,
        activitySubtitle: targetName,
        facts: [
          {
            name: 'Old Status',
            value: oldStatus,
          },
          {
            name: 'New Status',
            value: newStatus,
          },
        ],
      },
    ],
    potentialAction: [
      {
        '@type': 'OpenUri',
        name: 'View Details',
        targets: [
          {
            os: 'default',
            uri: url,
          },
        ],
      },
    ],
  }

  try {
    await axios.post(webhookUrl, message)
    console.log(`✅ Teams notification sent for status change`)
  } catch (error) {
    console.error('❌ Failed to send Teams notification:', error)
  }
}
