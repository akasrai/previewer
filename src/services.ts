import { Context } from 'probot';
import { getReviewers, validatePR } from './helper';

export const requestPRReview = async (context: Context) => {
  const reviewers = await getReviewers(context);
  const pullNumber = context.payload.pull_request.number;
  const auther = context.payload.pull_request.user.login;
  const repo = context.payload.pull_request.base.repo.name;
  const owner = context.payload.pull_request.base.repo.owner.login;

  await context.octokit.pulls.requestReviewers({
    owner,
    repo,
    pull_number: pullNumber,
    reviewers: reviewers.filter((r) => r !== auther),
  });
};

export const reviewPR = async (context: Context) => {
  const pullNumber = context.payload.pull_request.number;
  const auther = context.payload.pull_request.user.login;
  const repo = context.payload.pull_request.base.repo.name;
  const owner = context.payload.pull_request.base.repo.owner.login;

  const { isValid, comment } = await validatePR(context);

  context.octokit.pulls.createReview({
    repo,
    owner,
    pull_number: pullNumber,
    event: isValid ? 'APPROVE' : 'REQUEST_CHANGES',
    body: isValid
      ? `Hey @${auther},\n\nIt looks like you're all set!`
      : `Hey @${auther},\n\n## There's few items you need to take care of before we can merge this PR:\n ${comment}\n\n\n**Please fix these issues, I'll come back and take a look!**`,
  });

  context.octokit.checks.create({
    repo,
    owner,
    name: 'PR checklist validator',
    head_sha: context.payload.pull_request.head.sha,
    pull_number: pullNumber,
    status: 'completed',
    conclusion: isValid ? 'success' : 'failure',
    completed_at: new Date(),
    output: {
      title: 'PR checklist validator',
      summary: isValid
        ? 'PR checklist are valid!'
        : "Looks like you haven't reviewed your PR. Please review and update the PR checklist.",
    },
  });

  if (!isValid) {
    context.octokit.issues.addLabels({
      repo,
      owner,
      issue_number: pullNumber,
      labels: ['Changes Requested'],
    });
  }
};

const contexts = new Map();

export const reviewPROnEdit = (context: Context) => {
  if (!contexts.has(context.payload.pull_request.id)) {
    contexts.set(context.payload.pull_request.id, context);

    setTimeout(async () => {
      await reviewPR(contexts.get(context.payload.pull_request.id));
      contexts.delete(context.payload.pull_request.id);
    }, 60000);
  }

  contexts.set(context.payload.pull_request.id, context);
};
