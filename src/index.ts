import { Probot } from 'probot';
import { requestPRReview, reviewPR, reviewPROnEdit } from './services';

export = (app: Probot) => {
  app.on('pull_request.opened', (context) => {
    if (context.isBot) {
      return;
    }

    requestPRReview(context);
    reviewPR(context);
  });

  app.on('pull_request.reopened', (context) => {
    if (context.isBot) {
      return;
    }

    requestPRReview(context);
    reviewPR(context);
  });

  app.on('pull_request.edited', (context) => {
    if (context.isBot) {
      return;
    }

    reviewPROnEdit(context);
  });

  app.on('pull_request_review.submitted', (context) => {
    if (context.isBot) {
      return;
    }
  });

  app.on('pull_request.review_requested', (context) => {
    if (context.isBot) {
      return;
    }

    context.log.info('fuck', context.payload.pull_request.requested_reviewers);
    reviewPR(context);
  });
};
