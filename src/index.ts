import { Probot } from 'probot';

export = (app: Probot) => {
  app.on('issues.opened', async (context) => {
    const issueComment = context.issue({
      body: 'Thanks for opening this issue!',
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on('issues.closed', async (context) => {
    const issueComment = context.issue({
      body: 'This issue is closed!',
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on('issues.reopened', async (context) => {
    const issueComment = context.issue({
      body: 'Thanks for re-opening this issue!',
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on('pull_request.opened', async (context) => {
    const issueComment = context.pullRequest({
      body: 'This is test',
    });
    await context.octokit.pulls.createReviewComment(issueComment);
  });

  app.on('pull_request.reopened', async (context) => {
    const issueComment = context.pullRequest({
      body: 'This is test',
    });
    await context.octokit.pulls.createReviewComment(issueComment);
  });
};
