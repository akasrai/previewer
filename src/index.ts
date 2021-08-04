import { Probot } from 'probot';

export = (app: Probot) => {
  app.on('pull_request.opened', async (context) => {
    if (context.isBot) {
      return;
    }

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
    if (context.isBot) {
      return;
    }

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
        body: `Hey @${auther}, \n\n PR title format is incorrect. Please reformat the title as in example below.\n**CI-1555 Transfapay: Integrate OAuth bank widget**`,
        pull_number: pullNumber,
        event: 'REQUEST_CHANGES',
      });
    }
  });

  app.on('pull_request.edited', async (context) => {
    if (context.isBot) {
      return;
    }

    const config = await context.config('previewer.yml', { comment: 'test' });

    context.log.info('config: ', config?.comment);

    const body = context.payload.pull_request.body;
    const pullNumber = context.payload.pull_request.number;
    const auther = context.payload.pull_request.user.login;
    const repo = context.payload.pull_request.base.repo.name;
    const owner = context.payload.pull_request.base.repo.owner.login;

    const isTaskCompleted = body.match(/(- \[[ ]\].+)/g) === null;

    if (!isTaskCompleted) {
      await context.octokit.pulls.createReview({
        repo,
        owner,
        pull_number: pullNumber,
        event: 'REQUEST_CHANGES',
        body: `Hey @${auther}, please review your PR and update the checklist`,
      });
    }
  });
};
