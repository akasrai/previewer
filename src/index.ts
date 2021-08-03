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
    const pullNumber = context.payload.pull_request.number;
    const repo = context.payload.pull_request.base.repo.name;
    const owner = context.payload.pull_request.base.repo.owner.login;

    await context.octokit.pulls.requestReviewers({
      owner,
      repo,
      pull_number: pullNumber,
      reviewers: ['perisrai'],
    });

    const title = context.payload.pull_request.title;

    if (!/[A-Z]+-[0-9]+ [a-zA-Z]+:\s+([a-zA-Z]+( [a-zA-Z]+)+)/.test(title)) {
      await context.octokit.pulls.createReview({
        repo,
        owner,
        body: 'PR title format is not correct',
        pull_number: pullNumber,
        event: 'REQUEST_CHANGES',
      });
    }
  });

  app.on('pull_request.reopened', async (context) => {
    const title = context.payload.pull_request.title;
    const pullNumber = context.payload.pull_request.number;
    const auther = context.payload.pull_request.user.login;
    const repo = context.payload.pull_request.base.repo.name;
    const owner = context.payload.pull_request.base.repo.owner.login;

    const reviewers = ['akasrai', 'perisrai'];

    await context.octokit.pulls.requestReviewers({
      owner,
      repo,
      pull_number: pullNumber,
      reviewers: reviewers.filter((r) => r !== auther),
    });

    if (!/[A-Z]+-[0-9]+ [a-zA-Z]+:\s+([a-zA-Z]+( [a-zA-Z]+)+)/.test(title)) {
      await context.octokit.pulls.createReview({
        repo,
        owner,
        body: `@${auther} PR title format is in correct. Please reformat the title.`,
        pull_number: pullNumber,
        event: 'REQUEST_CHANGES',
      });
    }
  });

  app.on('pull_request.closed', async (context) => {
    const prComment = context.issue({
      body: 'This is test',
    });

    await context.octokit.issues.createComment(prComment);
  });
};
